// ============================================================
//  Commitlint — valida mensagens de commit no padrão Conventional Commits
//
//  Formato esperado:
//    <tipo>(<escopo opcional>): <descrição>
//
//  Tipos permitidos:
//    feat     — nova funcionalidade
//    fix      — correção de bug
//    docs     — documentação
//    style    — formatação (sem mudança de lógica)
//    refactor — refatoração
//    test     — adição/correção de testes
//    chore    — tarefas de manutenção (build, deps, etc.)
//    ci       — configuração de CI/CD
//    perf     — melhoria de performance
//    revert   — reversão de commit
//
//  Exemplos válidos:
//    feat(auth): adiciona login com Google
//    fix(vehicles): corrige validação de placa duplicada
//    docs: atualiza README com instruções Docker
// ============================================================

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
