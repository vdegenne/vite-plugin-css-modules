## Installation

```
npm i -D @vdegenne/vite-plugin-css-modules
```

## Usage

Add the plugin to vite

```js
import {cssModules} from '@vdegenne/vite-plugin-css-modules'

plugins: [cssModules()]
```

Then in your code importing a stylesheet like that

```js
import styles from './stylesheet.css' with {type: 'css'}
```

will resolve the import to a CSSStyleSheet containing the styles defined in the file.

Add `@vdegenne/vite-plugin-css-modules` in `tsconfig.json` types to override vite `"*.css"` imports if you need.
