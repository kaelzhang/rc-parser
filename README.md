[![Build Status](https://travis-ci.org/kaelzhang/readrc.svg?branch=master)](https://travis-ci.org/kaelzhang/readrc)
[![Coverage](https://codecov.io/gh/kaelzhang/readrc/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/readrc)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/readrc?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/readrc)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/readrc.svg)](http://badge.fury.io/js/readrc)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/readrc.svg)](https://www.npmjs.org/package/readrc)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/readrc.svg)](https://david-dm.org/kaelzhang/readrc)
-->

# readrc

Read rc, rc.js, rc.yaml or etc if any one of them exists

## Install

```sh
$ npm i readrc
```

## Usage

```js
const readrc = require('readrc')

const options = {
  cwd: '/path/to/project',
  name: '.eslintrc'
}

const rc = await readrc(options)

console.log(rc.extension) // yaml
console.log(rc.value)
// {
//   extends: 'airbnb-base'
// }

console.log(readrc.sync(options))  // the same as rc
```

## APIs

### readrc(options)

- **options**
  - **cwd** `string` the search path for the rc file.
  - **name** `string` the prefix name of the rc file to search.
  - **extensions** `Extensions | undefined`
  - **parsers** `Object{[Extension]: ParserFunction}`
  - **on_not_found** `NotFoundFunction` will be executed if no rc files are found.
  - **code_frame** `CodeFrameFunction | false`

Returns `Promise<RCResult>`

```ts
type Extension = string | readrc.NO_EXT
type Extensions = Array<Extension>
```

`options.extensions` specifies the extension priority for searching rc files.

`readrc.NO_EXT` is a special extension which indicates there is no extension after `name`

```sh
# Suppose: options.name === '.eslintrc'
#             filepath      |  extension
# ------------------------- | -----------------
/path/to/cwd
           | .eslintrc        # readrc.NO_EXT
           | .eslintrc.js     # 'js'
           | .eslintrc.yaml   # 'yaml'
```

```ts
interface RCResult {
  extension: string;
  value: object;
}
```

- **extension** the extension string of the found rc file, excluding `.`
- **value** the parsed value

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
function CodeFrameFunction (
  rawLines: string,
  line: number,
  column: number
): string
```

### readrc.sync(options)

- **options** the same as `options` of `readrc()`

## Built-in readers

### js

Wrapped from `require`

### yaml

Based on [`js-yaml`]()

### readrc.NO_EXT

json5

###

## License

MIT
