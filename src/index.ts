import fs from 'fs'
import path from 'path'
import {type Plugin} from 'vite'

export function cssModules(): Plugin {
	return {
		name: 'vite-inline-css-modules',
		enforce: 'pre',

		async transform(code, id) {
			if (!id.endsWith('.ts') && !id.endsWith('.js')) return null

			const importRegex =
				/import\s+(\w+)\s+from\s+['"]([^'"]+\.css)['"]\s+with\s*\{\s*type\s*:\s*['"]css['"]\s*\}\s*;?/g

			let match
			let transformed = code
			let hasMatch = false

			while ((match = importRegex.exec(code)) !== null) {
				hasMatch = true
				const varName = match[1]
				const importPath = match[2]

				if (!importPath) continue

				const absPath = path.resolve(path.dirname(id), importPath)
				let cssContent = await fs.promises.readFile(absPath, 'utf8')

				cssContent = cssContent
					.replace(/\\/g, '\\\\')
					.replace(/`/g, '\\`')
					.replace(/\$/g, '\\$')

				const replacement = `
const ${varName} = new CSSStyleSheet();
${varName}.replaceSync(\`${cssContent}\`);
`
				transformed = transformed.replace(match[0], replacement)
			}

			if (!hasMatch) return null
			return {code: transformed, map: null}
		},
	}
}

export default cssModules
