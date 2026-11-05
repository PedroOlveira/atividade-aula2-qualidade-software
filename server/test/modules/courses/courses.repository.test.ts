import { PgCourseRepository } from '../../../src/modules/courses/courses.repository';
import { Database } from '../../../src/database/connection';

const normalizeSql = (sql: string) => sql.replace(/\s+/g, ' ').trim();

describe('PgCourseRepository', () => {
  let dbMock: jest.Mocked<Database>;
  let repository: PgCourseRepository;

  beforeEach(() => {
    dbMock = { query: jest.fn() };
    repository = new PgCourseRepository(dbMock);
  });

  it('1. Criação: insere curso e retorna linha com RETURNING id, name', async () => {
    const row = { id: 1, name: 'Qualidade' };
    dbMock.query.mockResolvedValue({ rows: [row] } as any);

    const result = await repository.create({ name: 'Qualidade' });

    expect(dbMock.query).toHaveBeenCalledTimes(1);
    const [sql, params] = dbMock.query.mock.calls[0];
    expect(normalizeSql(sql)).toContain('INSERT INTO courses');
    expect(normalizeSql(sql)).toContain('RETURNING id, name');
    expect(params).toEqual(['Qualidade']);
    expect(result).toEqual(row);
  });

  it('2. Listagem com registros: executa SELECT ordenado por id', async () => {
    const rows = [{ id: 1, name: 'Qualidade' }];
    dbMock.query.mockResolvedValue({ rows } as any);

    const result = await repository.findAll();

    expect(dbMock.query).toHaveBeenCalledTimes(1);
    const [sql, params] = dbMock.query.mock.calls[0];
    expect(normalizeSql(sql)).toContain('SELECT id, name FROM courses');
    expect(normalizeSql(sql)).toContain('ORDER BY id');
    expect(params).toBeUndefined();
    expect(result).toEqual(rows);
  });

  it('3. Listagem vazia: retorna array vazio', async () => {
    dbMock.query.mockResolvedValue({ rows: [] } as any);
    const result = await repository.findAll();
    expect(result).toEqual([]);
  });

  it('4. Busca existente: busca por id com parâmetro $1', async () => {
    const row = { id: 7, name: 'Qualidade' };
    dbMock.query.mockResolvedValue({ rows: [row] } as any);

    const result = await repository.findOne(7);

    const [sql, params] = dbMock.query.mock.calls[0];
    expect(normalizeSql(sql)).toContain('WHERE id = $1');
    expect(params).toEqual([7]);
    expect(result).toEqual(row);
  });

  it('5. Busca inexistente: retorna undefined quando rows está vazio', async () => {
    dbMock.query.mockResolvedValue({ rows: [] } as any);
    const result = await repository.findOne(7);
    expect(result).toBeUndefined();
  });

  describe('6. Falhas do banco', () => {
    const err = new Error('Falha no PostgreSQL');

    it('propaga erro em create', async () => {
      dbMock.query.mockRejectedValue(err);
      await expect(repository.create({ name: 'Qualidade' })).rejects.toBe(err);
    });

    it('propaga erro em findAll', async () => {
      dbMock.query.mockRejectedValue(err);
      await expect(repository.findAll()).rejects.toBe(err);
    });

    it('propaga erro em findOne', async () => {
      dbMock.query.mockRejectedValue(err);
      await expect(repository.findOne(1)).rejects.toBe(err);
    });
  });
});