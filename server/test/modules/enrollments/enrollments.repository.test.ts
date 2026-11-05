import { PgEnrollmentRepository } from '../../../src/modules/enrollments/enrollments.repository';
import { Database } from '../../../src/database/connection';

const normalizeSql = (sql: string) => sql.replace(/\s+/g, ' ').trim();

describe('PgEnrollmentRepository', () => {
  let dbMock: jest.Mocked<Database>;
  let repository: PgEnrollmentRepository;
  const mockDate = new Date('2026-01-01T00:00:00.000Z');

  beforeEach(() => {
    dbMock = { query: jest.fn() };
    repository = new PgEnrollmentRepository(dbMock);
  });

  it('1. Criação: insere matrícula com aliases em camelCase', async () => {
    const row = { studentRa: 123, courseId: 7, enrolledAt: mockDate };
    dbMock.query.mockResolvedValue({ rows: [row] } as any);

    const result = await repository.create(123, 7);

    expect(dbMock.query).toHaveBeenCalledTimes(1);
    const [sql, params] = dbMock.query.mock.calls[0];
    const nSql = normalizeSql(sql);
    expect(nSql).toContain('INSERT INTO enrollments');
    expect(nSql).toContain('student_ra AS "studentRa"');
    expect(nSql).toContain('course_id AS "courseId"');
    expect(nSql).toContain('enrolled_at AS "enrolledAt"');
    expect(params).toEqual([123, 7]);
    expect(result).toEqual(row);
  });

  it('2. Listagem com registros: seleciona com aliases e ordena por student_ra, course_id', async () => {
    const rows = [{ studentRa: 123, courseId: 7, enrolledAt: mockDate }];
    dbMock.query.mockResolvedValue({ rows } as any);

    const result = await repository.findAll();

    const [sql, params] = dbMock.query.mock.calls[0];
    const nSql = normalizeSql(sql);
    expect(nSql).toContain('SELECT');
    expect(nSql).toContain('student_ra AS "studentRa"');
    expect(nSql).toContain('ORDER BY student_ra, course_id');
    expect(params).toBeUndefined();
    expect(result).toEqual(rows);
  });

  it('3. Listagem vazia: retorna array vazio', async () => {
    dbMock.query.mockResolvedValue({ rows: [] } as any);
    expect(await repository.findAll()).toEqual([]);
  });

  it('4. Busca existente: filtra por student_ra = $1 AND course_id = $2', async () => {
    const row = { studentRa: 123, courseId: 7, enrolledAt: mockDate };
    dbMock.query.mockResolvedValue({ rows: [row] } as any);

    const result = await repository.findOne(123, 7);

    const [sql, params] = dbMock.query.mock.calls[0];
    expect(normalizeSql(sql)).toContain('WHERE student_ra = $1 AND course_id = $2');
    expect(params).toEqual([123, 7]);
    expect(result).toEqual(row);
  });

  it('5. Busca inexistente: retorna undefined', async () => {
    dbMock.query.mockResolvedValue({ rows: [] } as any);
    expect(await repository.findOne(123, 7)).toBeUndefined();
  });

  describe('6. Falhas do banco', () => {
    const err = new Error('Erro de conexão');

    it('propaga erro em create', async () => {
      dbMock.query.mockRejectedValue(err);
      await expect(repository.create(123, 7)).rejects.toBe(err);
    });

    it('propaga erro em findAll', async () => {
      dbMock.query.mockRejectedValue(err);
      await expect(repository.findAll()).rejects.toBe(err);
    });

    it('propaga erro em findOne', async () => {
      dbMock.query.mockRejectedValue(err);
      await expect(repository.findOne(123, 7)).rejects.toBe(err);
    });
  });
});