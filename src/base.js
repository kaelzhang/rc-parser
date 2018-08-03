const yaml = require('js-yaml')
const json5 = require('json5')
const make_array = require('make-array')
const {codeFrameColumns} = require('@babel/code-frame')
const path = require('path')

const NO_EXT = Symbol('rc-finder-no-ext')
const DEFAULT_EXTENSIONS = [
  'yaml',
  'yml',
  'js',
  NO_EXT
]
const EXT_JS = 'js'

const yamlParser = content => {
  try {
    return yaml.safeLoad(content)
  } catch (error) {
    const {
      reason,
      mark: {
        line,
        column
      }
    } = error

    const err = new SyntaxError(reason)
    err.line = line
    err.column = column

    throw err
  }
}

const jsonParser = content => {
  try {
    return json5.parse(content)
  } catch (error) {
    const err = new SyntaxError(error.message)
    err.line = error.lineNumber
    err.column = error.columnNumber

    throw err
  }
}

const DEFAULT_PARSERS = {
  yaml: yamlParser,
  yml: yamlParser,
  json: jsonParser,
  [NO_EXT]: jsonParser
}

const DEFAULT_ON_NOT_FOUND = () => new Error('not found')
const DEFAULT_CODE_FRAME = (content, loc) =>
  codeFrameColumns(content, {start: loc})

const basename = (name, ext) => ext === NO_EXT
  ? name
  : `${name}.${ext}`

const isNumber = v => typeof v === 'number'
const isString = v => typeof v === 'string'
const isFound = v => v

class ReaderBase {
  constructor ({
    path: paths,
    name,
    extensions = DEFAULT_EXTENSIONS,
    parsers,
    not_found_error = DEFAULT_ON_NOT_FOUND,
    code_frame = DEFAULT_CODE_FRAME
  }, promise, extra) {
    const cleaned_paths = make_array(paths)
    .filter(Boolean)
    .map(p => path.resolve(p))

    if (cleaned_paths.length === 0) {
      throw new TypeError('options.path must be string or array of string(s)')
    }
    this._paths = cleaned_paths

    if (!isString(name)) {
      throw new TypeError('options.name must be a string')
    }

    this._promise = promise
    this._extra = extra

    this._name = name
    this._extensions = extensions
    this._parsers = parsers
      ? Object.assign({}, DEFAULT_PARSERS, parsers)
      : DEFAULT_PARSERS
    this._not_found_error = not_found_error
    this._code_frame = code_frame

    extensions.forEach(ext => {
      if (ext === EXT_JS || ext in this._parsers) {
        return
      }

      throw new Error(`parser for extension "${ext}" is not defined`)
    })
  }

  parse () {
    const result = this._searchAll()
    .then(found => {
      const {extension, abspath} = found

      if (extension === EXT_JS) {
        return {
          extension,
          abspath,
          value: require(abspath)
        }
      }

      return this._promise.resolve(this._readFile(abspath))
      .then(content => {
        found.content = content
        return this._parse(found)
      })
      .then(value => ({
        value,
        extension,
        abspath
      }))
    })

    return this._teardown(result)
  }

  _searchAll () {
    return this._extra.find(this._paths, isFound, (_, p) => this._search(p))
    .then(found => {
      if (found) {
        return found
      }

      throw this._not_found_error(this._paths, this._extensions)
    })
  }

  _search (search_path) {
    return this._extra.find(
      this._extensions,
      ({abspath}) => this._exists(abspath),
      (_, extension) => {
        const filename = basename(this._name, extension)
        const abspath = path.join(search_path, filename)

        return {
          abspath,
          extension
        }
      }
    )
  }

  _parse ({
    extension,
    abspath,
    content
  }) {
    const parser = this._parsers[extension]

    try {
      return parser(content)
    } catch (error) {
      const {line, column} = error
      const isLine = isNumber(line)
      const isColumn = isNumber(column)
      const loc = {}

      let path_message = `${abspath}:`

      if (isLine) {
        loc.line = line
        path_message += line
      }

      if (isColumn) {
        loc.column = column
        path_message += `:${column}`
      }

      const frame_message = isLine
        ? this._code_frame(content, loc)
        : ''

      error.message = `${path_message}
${frame_message}

${error.message}`

      throw error
    }
  }
}

const checkOptions = options => {
  if (!options) {
    throw new TypeError('options must be an object')
  }

  return options
}

module.exports = {
  checkOptions,
  ReaderBase,
  NO_EXT,
  PARSERS: {
    yaml: yamlParser,
    yml: yamlParser,
    json: jsonParser
  }
}
