import { isForeignKeyViolation } from '../../src/database/foreign-key-violation';

describe('src/database/foreign-key-violation.ts', () => {
  it('retorna true para objeto com code "23503"', () => {
    expect(isForeignKeyViolation({ code: '23503' })).toBe(true);
  });

  test.each([
    [null],
    [undefined],
    ['23505'],
    [23503],
    [{}],
    [{ code: 'outro' }],
  ])('retorna false para entrada inválida ou código diferente: %p', (input) => {
    expect(isForeignKeyViolation(input)).toBe(false);
  });
});