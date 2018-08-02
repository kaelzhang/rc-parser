const fs = require('fs')
const {factory} = require('promise.extra')

const {ReaderBase, checkOptions, NO_EXT} = require('./base')

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

const readrc = options => new Reader(checkOptions(options)).parse()
readrc.NO_EXT = NO_EXT

module.exports = readrc
