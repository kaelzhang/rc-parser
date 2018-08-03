const {test} = require('ava')
const path = require('path')
const log = require('util').debuglog('rc-finder')

const find = require('..')
const sync = require('../sync')

const fixture = (...p) => path.join(__dirname, 'fixtures', ...p)

const CASES = [
  {
    p: 'invalid-yaml',
    error: {
      line: 2,
      column: 0
    }
  }
]

/* eslint no-console: 'off' */
console.log()

const run = (type, finder) => {
  CASES.forEach(({
    p,
    extensions,
    name = '.eslintrc',
    error
  }) => {
    test(`${type}: ${p}`, t => {
      return finder({
        name,
        path: fixture(p),
        extensions
      })
      .then(
        result => {

        },

        err => {
          log(`${p}: error:\n`, err)

          if (!error) {
            t.fail('should not fail')
            return
          }

          t.is(err.line, error.line, 'line')
          t.is(err.column, error.column, 'column')
        }
      )
    })
  })
}

run('async', find)
run('sync', sync)

// test('normal', async t => {
//   const result = await find({
//     path: fixture('normal'),
//     name: '.eslintrc'
//   })

//   const {
//     value,
//     extension,
//     abspath
//   } = result

//   t.is(value.extends, 'airbnb-base')
//   t.is(extension, find.NO_EXT)
//   t.is(abspath, fixture('normal', '.eslintrc'))
// })
