import {init, parse} from 'es-module-lexer'
import fs from 'fs'
import path from 'path'
import {type Plugin} from 'vite'

export function cssModules(): Plugin {
	return {
		name: 'vite-css-modules',
		enforce: 'pre',

		async transform(code, id) {
			const cleanId = id.replace(/[?#].*$/, '')
			if (!cleanId.endsWith('.ts') && !cleanId.endsWith('.js')) return null

			await init()
			const [imports] = parse(code)

			const cssImports = imports.filter(
				(i) =>
					i.type === 'static' &&
					i.attributes?.some(
						([key, value]) => key === 'type' && value === 'css',
					),
			)

			if (!cssImports.length) return null

			let transformed = code

			for (const i of cssImports.reverse()) {
				const varName = code
					.slice(i.importStart, i.start)
					.match(/import\s+(\w+)\s+from/)?.[1]

				const importPath = i.specifier

				if (!varName || !importPath) continue

				const absPath = path.resolve(path.dirname(cleanId), importPath)
				let cssContent = await fs.promises.readFile(absPath, 'utf8')

				cssContent = cssContent
					.replace(/\\/g, '\\\\')
					.replace(/`/g, '\\`')
					.replace(/\$/g, '\\$')

				const replacement = `
const ${varName} = new CSSStyleSheet();
${varName}.replaceSync(\`${cssContent}\`);
`

				transformed =
					transformed.slice(0, i.importStart) +
					replacement +
					transformed.slice(i.importEnd)
			}

			if (transformed === code) return null
			return {code: transformed, map: null}
		},
	}
}

export default cssModules
