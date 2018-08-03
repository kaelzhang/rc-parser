[![Build Status](https://travis-ci.org/kaelzhang/rc-parser.svg?branch=master)](https://travis-ci.org/kaelzhang/rc-parser)
[![Coverage](https://codecov.io/gh/kaelzhang/rc-parser/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/rc-parser)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/rc-parser?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/rc-parser)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/rc-parser.svg)](http://badge.fury.io/js/rc-parser)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/rc-parser.svg)](https://www.npmjs.org/package/rc-parser)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/rc-parser.svg)](https://david-dm.org/kaelzhang/rc-parser)
-->

# rc-parser

Find and parse rc, rc.js, rc.yaml or etc if any one of them exists. `rc-parser` searches the giving path(s), and parses out that if the runtime configuration file with the certain extension listed in `options.extensions` exists. If found, it parses and returns the config object.

`rc-parser` featured in:

- Supports to define custom parser for a certain file type.
- Better error messages and syntax hint.
- Fully customizable.

## Install

```sh
$ npm i rc-parser
```

## Usage

```js
const parse = require('rc-parser')
const sync = require('rc-parser/sync')  // The synchronous version

const options = {
  path: __dirname,  // current directory
  name: '.travis'
}

const rc = await parse(options)

console.log(rc.extension)         // 'yml'
console.log(rc.value.language)    // 'node_js'

console.log(sync(options))  // the same as rc
```

### Define your own parsers to support more file types

```js
const ini = require('ini')

parse({
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

### parse(options): Promise&lt;RCResult&gt;

- **options**
  - **path** `string | Array<string>` the search path(s) for the rc file.
  - **name** `string` the prefix name of the rc file to search.
  - **extensions** `Extensions | undefined`
  - **parsers** `Object{[Extension]: ParserFunction}`
  - **not_found_error** `NotFoundErrorFunction` will be executed if no rc files are found.
  - **code_frame** `CodeFrameFunction | false`

Returns `Promise<RCResult>`

```ts
type Extension = string | parse.NO_EXT
type Extensions = Array<Extension>
```

`options.extensions` specifies the extension priority for searching rc files. Defaults to `['yaml', 'yml', 'js', parse.NO_EXT]`

`parse.NO_EXT` is a special extension which indicates there is no extension after `name`

```sh
# Suppose: options.name === '.eslintrc'
#             filepath      |  extension
# ------------------------- | -----------------
/path/to/project
          |-- .eslintrc        # rc-parser.NO_EXT
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
- **filepath** the filepath relative to the current search path

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

### sync(options): RCResult

- **options** the same as `options` of `parse(options)`

## Built-in parsers

```js
parse.PARSERS.<type>
```

### yaml, yml

Based on [`js-yaml`](https://npmjs.org/package/js-yaml)

### json

Based on [`json5`](https://npmjs.org/package/json5)

## License

MIT
