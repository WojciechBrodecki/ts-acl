module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // nowa funkcjonalność
        'fix',      // naprawa błędu
        'docs',     // aktualizacja dokumentacji
        'style',    // formatowanie, brak zmian w kodzie
        'refactor', // refaktoryzacja kodu
        'perf',     // poprawa wydajności
        'test',     // dodanie lub modyfikacja testów
        'chore',    // maintenance, aktualizacja zależności
        'ci',       // zmiany w CI/CD
        'build',    // zmiany w systemie budowania
        'revert'    // cofnięcie poprzedniego commita
      ]
    ],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100]
  }
};
