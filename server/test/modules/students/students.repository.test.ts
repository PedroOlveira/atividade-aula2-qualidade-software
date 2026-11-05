import { PgStudentRepository } from '../../../src/modules/students/students.repository';
import { Database } from '../../../src/database/connection';

const normalizeSql = (sql: string) => sql.replace(/\s+/g, ' ').trim();

describe('PgStudentRepository', () => {
  let dbMock: jest.Mocked<Database>;
  let repository: PgStudentRepository;

  beforeEach(() => {
    dbMock = { query: jest.fn() };
    repository = new PgStudentRepository(dbMock);
  });

  it('1. Criação: insere aluno e usa RETURNING ra, name', async () => {
    const row = { ra: 123, name: 'Ana' };
    dbMock.query.mockResolvedValue({ rows: [row] } as any);

    const result = await repository.create({ ra: 123, name: 'Ana' });

    expect(dbMock.query).toHaveBeenCalledTimes(1);
    const [sql, params] = dbMock.query.mock.calls[0];
    expect(normalizeSql(sql)).toContain('INSERT INTO students');
    expect(normalizeSql(sql)).toContain('RETURNING ra, name');
    expect(params).toEqual([123, 'Ana']);
    expect(result).toEqual(row);
  });

  it('2. Listagem com registros: ordena por nome', async () => {
    const rows = [{ ra: 123, name: 'Ana' }];
    dbMock.query.mockResolvedValue({ rows } as any);

    const result = await repository.findAll();

    const [sql, params] = dbMock.query.mock.calls[0];
    expect(normalizeSql(sql)).toContain('SELECT ra, name FROM students');
    expect(normalizeSql(sql)).toContain('ORDER BY name');
    expect(params).toBeUndefined();
    expect(result).toEqual(rows);
  });

  it('3. Listagem vazia: retorna array vazio', async () => {
    dbMock.query.mockResolvedValue({ rows: [] } as any);
    expect(await repository.findAll()).toEqual([]);
  });

  it('4. Busca existente: filtra por ra = $1', async () => {
    const row = { ra: 123, name: 'Ana' };
    dbMock.query.mockResolvedValue({ rows: [row] } as any);

    const result = await repository.findOne(123);

    const [sql, params] = dbMock.query.mock.calls[0];
    expect(normalizeSql(sql)).toContain('WHERE ra = $1');
    expect(params).toEqual([123]);
    expect(result).toEqual(row);
  });

  it('5. Busca inexistente: retorna undefined', async () => {
    dbMock.query.mockResolvedValue({ rows: [] } as any);
    expect(await repository.findOne(123)).toBeUndefined();
  });

  describe('6. Falhas do banco', () => {
    const err = new Error('Erro de conexão');

    it('propaga erro em create', async () => {
      dbMock.query.mockRejectedValue(err);
      await expect(repository.create({ ra: 123, name: 'Ana' })).rejects.toBe(err);
    });

    it('propaga erro em findAll', async () => {
      dbMock.query.mockRejectedValue(err);
      await expect(repository.findAll()).rejects.toBe(err);
    });

    it('propaga erro em findOne', async () => {
      dbMock.query.mockRejectedValue(err);
      await expect(repository.findOne(123)).rejects.toBe(err);
    });
  });
});