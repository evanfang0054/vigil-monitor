/**
第一个数字（例如 [1, 2]）表示规则的级别：
  0 - 关闭规则（不检查）。
  1 - 警告（warn），不会失败。
  2 - 错误（error），违反规则将导致构建失败。
第二个参数通常是规则的配置，例如 'always' 或 'never'，表示规则应该始终被应用或从不应用。
第三个参数是具体的限制或选项，例如最大长度（100）或一个枚举列表（['feat', 'fix', ...]）。
*/

module.exports = {
  parserPreset: 'conventional-changelog-conventionalcommits',
  rules: {
    'body-leading-blank': [2, 'always'], // 提交信息正文开始前必须有一个空行
    'body-max-line-length': [2, 'always', 100], // 提交信息正文每行的最大长度
    'footer-leading-blank': [2, 'always'], // 提交信息脚注开始前必须有一个空行。
    'footer-max-line-length': [2, 'always', 100], // 提交信息脚注每行的最大长度。
    'header-max-length': [2, 'always', 100], // 提交信息头部的最大长度。
    'scope-case': [2, 'always', 'lower-case'], // 提交信息范围字段的大小写格式。
    'subject-case': [2, 'always', 'lowerCase'], // 提交信息主题的大小写格式
    'subject-empty': [2, 'never'], // 不允许空的主题。
    'subject-full-stop': [2, 'never', '.'], // 题后不允许或必须有句号
    'type-case': [2, 'always', 'lower-case'], // 提交信息类型字段的大小写格式。
    'type-empty': [2, 'never'], // 不允许空的类型。
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'init',
        'perf',
        'refactor',
        'revert',
        'style',
        'test'
      ],
    ], // 类型字段必须是枚举列表中的一个值 https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional
    // 'signed-off-by': [0, 'always', 'Signed-off-by:'],
  },
};
