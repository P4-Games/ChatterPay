module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'perf', 'build', 'ci', 'docs', 'refactor', 'style', 'test', 'chore', 'revert']
    ]
  },
  parserPreset: {
    parserOpts: {
      headerPattern: /^\[(\w+?)\]\s(.+)$/,
      headerCorrespondence: ['type', 'subject']
    }
  }
}
