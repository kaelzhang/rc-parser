[![Build Status](https://travis-ci.org/kaelzhang/rc-finder.svg?branch=master)](https://travis-ci.org/kaelzhang/rc-finder)
[![Coverage](https://codecov.io/gh/kaelzhang/rc-finder/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/rc-finder)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/rc-finder?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/rc-finder)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/rc-finder.svg)](http://badge.fury.io/js/rc-finder)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/rc-finder.svg)](https://www.npmjs.org/package/rc-finder)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/rc-finder.svg)](https://david-dm.org/kaelzhang/rc-finder)
-->

# rc-finder

Find and parse rc, rc.js, rc.yaml or etc if any one of them exists. `rc-finder` searches the giving path(s), and finds out that if the runtime configuration file with the certain extension listed in `options.extensions` exists. If found, it parses and returns the config object.

`rc-finder` featured in:

- Supports to define custom parser for a certain file type.
- Better error messages and syntax hint.
- Fully customizable.

## Install

```sh
$ npm i rc-finder
```

## Usage

```js
const find = require('rc-finder')
const sync = require('rc-finder/sync')

const options = {
  path: __dirname,  // current directory
  name: '.travis'
}

const rc = await find(options)

console.log(rc.extension)         // 'yml'
console.log(rc.value.language)    // 'node_js'

console.log(sync(options))  // the same as rc
```

### Define your own parsers to support more file types

```js
const ini = require('ini')

find({
  path: '/path/to',
  name: 'somerc',
  extensions: ['ini', 'js'],
  parsers: {
    ini (content) {
      return ini.parse(content)
    }
  }
})
.then(({extension, value}) => {
  console.log(extension)   // 'ini'
  console.log(value)       // the parsed object from ini
})
```

## APIs

### find(options): Promise<RCResult>

- **options**
  - **path** `string | Array<string>` the search path(s) for the rc file.
  - **name** `string` the prefix name of the rc file to search.
  - **extensions** `Extensions | undefined`
  - **parsers** `Object{[Extension]: ParserFunction}`
  - **not_found_error** `NotFoundErrorFunction` will be executed if no rc files are found.
  - **code_frame** `CodeFrameFunction | false`

Returns `Promise<RCResult>`

```ts
type Extension = string | find.NO_EXT
type Extensions = Array<Extension>
```

`options.extensions` specifies the extension priority for searching rc files. Defaults to `['yaml', 'yml', 'js', find.NO_EXT]`

`find.NO_EXT` is a special extension which indicates there is no extension after `name`

```sh
# Suppose: options.name === '.eslintrc'
#             filepath      |  extension
# ------------------------- | -----------------
/path/to/project
          |-- .eslintrc        # rc-finder.NO_EXT
          |-- .eslintrc.js     # 'js'
          |-- .eslintrc.yaml   # 'yaml'
```

If `options.extensions` as `['yaml', 'js', NO_EXT]`, then we will get `.eslintrc.yaml`.

Similarly, `['js', 'yaml', NO_EXT]` => `.eslintrc.js`

```ts
interface RCResult {
  extension: string;
  abspath: string;
  value: object;
}
```

- **extension** the extension string of the found rc file, excluding `.`
- **value** the parsed value
- **abspath** the absolute path of the rc file.

```ts
function ParserFunction (object: {
  content: string,
  filepath: string,
  abspath: string,
  extension: string
}): object throws ParserError
```

- **content** the content of the rc file
- **filepath** the filepath relative to `options.cwd`

Parses the content of rc files, returns the parsed object, or throws error if there is a parse error.

```ts
interface ParserError extends Error {
  line?: number;
  column?: number;
}
```

If the error (`ParserError`) thrown by `ParserFunction` contains both the `line` property and the `column` property, the `error.message` will be argumented by `CodeFrameFunction`

```ts
interface Location {
  line: number;
  column: number;
}

function CodeFrameFunction (
  rawLines: string,
  loc: Location
): string
```

```ts
function NotFoundErrorFunction (
  paths: Array<string>,
  extensions: Extensions
): Error
```

### rc-finder.sync(options): RCResult

- **options** the same as `options` of `find(options)`

## Built-in parsers

```js
find.PARSERS.<type>
```

### yaml, yml

Based on [`js-yaml`](https://npmjs.org/package/js-yaml)

### json

Based on [`json5`](https://npmjs.org/package/json5)

## License

MIT
