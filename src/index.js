const fs = require('fs')
const yaml = require('js-yaml')
const json5 = require('json5')

const NO_EXT = Symbol('readrc-no-ext')
const DEFAULT_EXTENSIONS = [
  'yaml',
  'js',
  NO_EXT
]

const DEFAULT_PARSERS = {
  yaml (content) {

  },

  [NO_EXT] (content) {
    try {
      return json5.parse(content)
    } catch (err) {
      const error = new SyntaxError(err.message)
      error.line = err.lineNumber
                          }}}}}}}}}}}}
    }
  }
}

class ReaderBase {
  constructor ({
    cwd,

  }) {

  }
}

class Reader {
  _exists (filepath) {

  }
}

class SyncReader {
  _exists (filepath) {

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
