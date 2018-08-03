const {test} = require('ava')
const path = require('path')
const log = require('util').debuglog('rc-parser')
const ini = require('ini')

const parse = require('..')
const sync = require('../sync')

const fixture = (...p) => path.join(__dirname, 'fixtures', ...p)

const CASES = [
  {
    p: 'invalid-yaml',
    options: {
      name: '.eslintrc',
      path: fixture('invalid-yaml'),
    },
    error: {
      line: 2,
      column: 0
    }
  },

  {
    p: 'normal',
    options: {
      name: '.eslintrc',
      path: fixture('normal')
    },
    expect: {
      value: {
        extends: 'airbnb-base.yaml'
      },
      abspath: fixture('normal', '.eslintrc.yaml'),
      extension: 'yaml'
    }
  },

  {
    d: 'no ext',
    p: 'normal',
    options: {
      name: '.eslintrc',
      path: fixture('normal'),
      extensions: [parse.NO_EXT, 'yaml']
    },
    expect: {
      value: {
        extends: 'airbnb-base'
      },
      abspath: fixture('normal', '.eslintrc'),
      extension: parse.NO_EXT
    }
  },

  {
    d: 'yml',
    p: 'normal',
    options: {
      name: '.eslintrc',
      path: fixture('normal'),
      extensions: ['yml', 'yaml']
    },
    expect: {
      value: {
        extends: 'airbnb-base.yml'
      },
      abspath: fixture('normal', '.eslintrc.yml'),
      extension: 'yml'
    }
  },

  {
    d: 'js',
    p: 'normal',
    options: {
      name: '.eslintrc',
      path: fixture('normal'),
      extensions: ['js', 'yaml']
    },
    expect: {
      value: {
        extends: 'airbnb-base.js'
      },
      abspath: fixture('normal', '.eslintrc.js'),
      extension: 'js'
    }
  },

  {
    d: 'constructor error: options.path',
    options: {
      name: '.eslintrc'
    },
    error (t, err) {
      t.is(err.message.indexOf('options.path') !== - 1, true)
    }
  },

  {
    d: 'constructor error: options.name',
    options: {
      path: fixture('normal')
    },
    error (t, err) {
      t.is(err.message.indexOf('options.name') !== - 1, true)
    }
  },

  {
    d: 'constructor: options',
    error (t, err) {
      t.is(err.message, 'options must be an object')
    }
  },

  {
    d: 'not found',
    options: {
      path: fixture('not-found'),
      name: '.eslintrc'
    },
    error (t, err) {
      t.is(err.message, 'not found')
    }
  },

  {
    d: 'parser not found',
    options: {
      name: '.eslintrc',
      path: fixture('normal'),
      extensions: ['unknown-type', 'yaml']
    },
    error (t, err) {
      t.is(err.message.indexOf('unknown-type') !== - 1, true)
    }
  },

  {
    d: 'error json',
    options: {
      name: '.eslintrc',
      path: fixture('invalid-json'),
      extensions: ['json']
    },
    error: {
      line: 3,
      column: 0
    }
  },

  {
    d: 'custom parser: ini',
    options: {
      name: '.eslintrc',
      path: fixture('normal'),
      extensions: ['ini', 'js'],
      parsers: {
        ini: content => ini.parse(content)
      }
    },
    expect: {
      value: {
        extends: 'airbnb-base.ini'
      },
      abspath: fixture('normal', '.eslintrc.ini'),
      extension: 'ini'
    }
  }
]

const getTest = only => only
  ? test.only
  : test

const run = (type, parser, runner) => {
  CASES.forEach(({
    d = '',
    p = '',
    options,
    error,
    expect,
    only
  }) => {
    getTest(only)(`${type}: ${p}: ${d}`, t =>
      runner(
        () => parser(options),

        result => {
          if (error) {
            t.fail('should fail')
            return
          }

          t.deepEqual(result, expect)
        },

        err => {
          log(`${p}: error:\n`, err)

          if (!error) {
            t.fail('should not fail')
            return
          }

          if (typeof error === 'function') {
            error(t, err)
            return
          }

          t.is(err.line, error.line, 'line')
          t.is(err.column, error.column, 'column')
        }
      )
    )
  })
}

run('async', parse, (factory, then, error) => {
  try {
    return factory().then(then, error)
  } catch (err) {
    error(err)
  }
})

run('sync', sync, (factory, then, error) => {
  try {
    return then(factory())
  } catch (err) {
    error(err)
  }
})

// test('normal', async t => {
//   const result = await parse({
//     path: fixture('normal'),
//     name: '.eslintrc'
//   })

//   const {
//     value,
//     extension,
//     abspath
//   } = result

//   t.is(value.extends, 'airbnb-base')
//   t.is(extension, parse.NO_EXT)
//   t.is(abspath, fixture('normal', '.eslintrc'))
// })
