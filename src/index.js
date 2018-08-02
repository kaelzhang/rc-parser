const fs = require('fs')
const yaml = require('js-yaml')
const json5 = require('json5')
const make_array = require('make-array')

const NO_EXT = Symbol('readrc-no-ext')
const DEFAULT_EXTENSIONS = [
  'yaml',
  'js',
  NO_EXT
]

const DEFAULT_PARSERS = {
  yaml (content) {
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
  },

  [NO_EXT] (content) {
    try {
      return json5.parse(content)
    } catch (error) {
      const err = new SyntaxError(err.message)
      err.line = error.lineNumber
      err.column = error.columnNumber

      throw err
    }
  }
}

const DEFAULT_ON_NOT_FOUND = () => {
  throw new Error('')
}

const DEFAULT_CODE_FRAME = () => {

}

class ReaderBase {
  constructor ({
    path,
    name,
    extensions = DEFAULT_EXTENSIONS,
    parsers = {},
    on_not_found = DEFAULT_ON_NOT_FOUND,
    code_frame = DEFAULT_CODE_FRAME
  }) {

  }
}

class Reader extends ReaderBase {
  _exists (abspath) {
    return new Promise(resolve => {
      fs.access(abspath, fs.constants.R_OK, err => {
        resolve(!err)
      })
    })
  }

  _read (abspath) {
    return new Promise((resolve, reject) => {
      fs.readFile(abspath, (err, content) => {
        if (err) {
          return reject(err)
        }

        resolve(content)
      })
    })
  }
}

class SyncReader extends ReaderBase {
  _exists (abspath) {
    try {
      fs.accessSync(abspath, fs.constants.R_OK)
      return true
    } catch (err) {
      return false
    }
  }

  _read (abspath) {
    return fs.readFileSync(abspath)
  }
}

const checkOptions = options => {
  if (!options) {
    throw new TypeError('options must be an object')
  }

  return options
}

const readrc = options => new Reader(checkOptions(options)).parse()
readrc.sync = options => new SyncReader(checkOptions(options)).parse()

module.exports = readrc
