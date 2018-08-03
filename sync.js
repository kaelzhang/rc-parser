const fs = require('fs')
const FakePromise = require('promise-faker')
const {factory} = require('promise.extra')

const {
  ReaderBase, checkOptions, NO_EXT, PARSERS
} = require('./src/base')

const extra = factory(FakePromise)

class SyncReader extends ReaderBase {
  constructor (options) {
    super(options, FakePromise, extra)
  }

  _exists (abspath) {
    try {
      fs.accessSync(abspath, fs.constants.R_OK)
      return true
    } catch (err) {
      return false
    }
  }

  _readFile (abspath) {
    return fs.readFileSync(abspath).toString()
  }

  _teardown (promise) {
    return this._promise.resolve(promise, true)
  }
}


const parse = options => new SyncReader(checkOptions(options)).parse()
parse.NO_EXT = NO_EXT
parse.PARSERS = PARSERS

module.exports = parse
