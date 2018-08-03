const fs = require('fs')
const {factory} = require('promise.extra')

const {
  ReaderBase, checkOptions, NO_EXT, PARSERS
} = require('./base')

const extra = factory(Promise)

class Reader extends ReaderBase {
  constructor (options) {
    super(options, Promise, extra)
  }

  _exists (abspath) {
    return new Promise(resolve => {
      fs.access(abspath, fs.constants.R_OK, err => {
        resolve(!err)
      })
    })
  }

  _readFile (abspath) {
    return new Promise((resolve, reject) => {
      fs.readFile(abspath, (err, content) => {
        if (err) {
          return reject(err)
        }

        resolve(content.toString())
      })
    })
  }

  _teardown (promise) {
    return promise
  }
}

const parse = options => new Reader(checkOptions(options)).parse()
parse.NO_EXT = NO_EXT
parse.PARSERS = PARSERS

module.exports = parse
