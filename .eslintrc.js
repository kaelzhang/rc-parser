module.exports = {
  extends: require.resolve('eslint-config-ostai'),
  rules: {
    'class-methods-use-this': 'off',
    'import/no-dynamic-require': 'off',
    'global-require': 'off'
  }
}
