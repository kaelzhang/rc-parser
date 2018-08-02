const {test} = require('ava')
const path = require('path')

const readrc = require('..')

const fixture = (...p) => path.join(__dirname, 'fixtures', ...p)

test('normal', async t => {
  const result = await readrc({
    path: fixture('normal'),
    name: '.eslintrc'
  })

  const {
    value,
    extension,
    abspath
  } = result

  t.is(value.extends, 'airbnb-base')
  t.is(extension, readrc.NO_EXT)
  t.is(abspath, fixture('normal', '.eslintrc'))
})
