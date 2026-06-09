module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'ci', 'perf', 'revert'],
    ],
    'subject-case': [2, 'never', ['upper-case']],
    'subject-min-length': [2, 'always', 5],
    'subject-max-length': [2, 'always', 100],
    'header-max-length': [2, 'always', 120],
  },
};
