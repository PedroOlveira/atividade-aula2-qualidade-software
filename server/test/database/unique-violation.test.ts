import { isUniqueViolation } from '../../src/database/unique-violation';

describe('src/database/unique-violation.ts', () => {
  it('retorna true para objeto com code "23505"', () => {
    expect(isUniqueViolation({ code: '23505' })).toBe(true);
  });

  test.each([
    [null],
    [undefined],
    ['23505'],
    [23503],
    [{}],
    [{ code: 'outro' }],
  ])('retorna false para entrada inválida ou código diferente: %p', (input) => {
    expect(isUniqueViolation(input)).toBe(false);
  });
});