import { positiveInteger, parseId, validateName, validateBody } from '../src/validation';
import { HttpError } from '../src/errors';

describe('src/validation.ts', () => {
  describe('positiveInteger', () => {
    test.each([
      [1, 1],
      [2147483647, 2147483647],
    ])('retorna o próprio número para inteiros positivos válidos: %p', (input, expected) => {
      expect(positiveInteger(input, 'RA')).toBe(expected);
    });

    test.each([
      [0],
      [-1],
      [1.5],
      [NaN],
      [Infinity],
      [2147483648],
      ['123'],
      [null],
      [undefined],
    ])('rejeita entrada inválida lançando HttpError 400: %p', (input) => {
      expect(() => positiveInteger(input as any, 'RA')).toThrow(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  describe('parseId', () => {
    test.each([
      ['1', 1],
      ['2147483647', 2147483647],
    ])('converte string numérica válida %p para número %p', (input, expected) => {
      expect(parseId(input, 'RA')).toBe(expected);
    });

    test.each([
      ['1abc'],
      ['1.2'],
      ['1e2'],
      [''],
      ['-1'],
      ['0'],
      ['2147483648'],
      [123],
    ])('rejeita entrada %p lançando HttpError 400', (input) => {
      expect(() => parseId(input as any, 'RA')).toThrow(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  describe('validateName', () => {
    const string100 = 'a'.repeat(100);
    test.each([
      ['Ana', 'Ana'],
      [string100, string100],
    ])('retorna o nome recebido para valores válidos', (input, expected) => {
      expect(validateName(input)).toBe(expected);
    });

    const string101 = 'a'.repeat(101);
    test.each([
      [''],
      ['ab'],
      ['   '],
      [' a '],
      [string101],
      [123],
      [null],
      [undefined],
    ])('rejeita o nome inválido %p com HttpError 400', (input) => {
      expect(() => validateName(input as any)).toThrow(
        expect.objectContaining({ statusCode: 400 })
      );
    });
  });

  describe('validateBody', () => {
    it('retorna a mesma referência para objeto congelado válido', () => {
      const obj = Object.freeze({ name: 'Ana' });
      expect(validateBody(obj)).toBe(obj);
    });

    test.each([
      [null],
      [undefined],
      [[]],
      ['Ana'],
      [12],
    ])('rejeita corpo inválido %p com HttpError 400', (input) => {
      expect(() => validateBody(input as any)).toThrow(
        expect.objectContaining({ statusCode: 400 })
      );
    });

    it('aceita campos extras e retorna a mesma referência sem alterar o objeto', () => {
      const body = { name: 'Ana', extra: true };
      const result = validateBody(body);
      expect(result).toBe(body);
      expect(result).toEqual({ name: 'Ana', extra: true });
    });
  });
});