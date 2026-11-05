import { EnrollmentsService } from '../../../src/modules/enrollments/enrollments.service';
import { EnrollmentRepository } from '../../../src/modules/enrollments/enrollments.repository';

describe('EnrollmentsService', () => {
  let repositoryMock: jest.Mocked<EnrollmentRepository>;
  let service: EnrollmentsService;
  const mockDate = new Date('2026-01-01T00:00:00.000Z');

  beforeEach(() => {
    repositoryMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };
    service = new EnrollmentsService(repositoryMock);
  });

  it('1. Criação válida: cria matrícula enviando studentRa e courseId separados', async () => {
    const created = { studentRa: 123, courseId: 1, enrolledAt: mockDate };
    repositoryMock.create.mockResolvedValue(created);

    const result = await service.create({ studentRa: 123, courseId: 1 });
    expect(repositoryMock.create).toHaveBeenCalledWith(123, 1);
    expect(result).toEqual(created);
  });

  test.each([
    [{ studentRa: 0, courseId: 1 }],
    [{ studentRa: 123, courseId: 0 }],
  ])('2. Chave inválida: rejeita %p com erro 400 sem chamar create', async (input) => {
    await expect(service.create(input as any)).rejects.toMatchObject({ statusCode: 400 });
    expect(repositoryMock.create).not.toHaveBeenCalled();
  });

  it('3. Referência inexistente: lança erro 404 para violação de chave estrangeira', async () => {
    repositoryMock.create.mockRejectedValue({ code: '23503' });
    await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toMatchObject({ statusCode: 404 });
  });

  it('4. Matrícula duplicada: lança erro 409 para violação de chave única', async () => {
    repositoryMock.create.mockRejectedValue({ code: '23505' });
    await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toMatchObject({ statusCode: 409 });
  });

  it('5. Busca inexistente: lança erro 404 e passa os IDs na ordem correta', async () => {
    repositoryMock.findOne.mockResolvedValue(undefined);
    await expect(service.findOne(123, 1)).rejects.toMatchObject({ statusCode: 404 });
    expect(repositoryMock.findOne).toHaveBeenCalledWith(123, 1);
  });

  it('6. Falha inesperada na criação: propaga a mesma instância de erro', async () => {
    const err = new Error('Falha no banco');
    repositoryMock.create.mockRejectedValue(err);
    await expect(service.create({ studentRa: 123, courseId: 1 })).rejects.toBe(err);
  });

  it('7. Listagem: retorna lista chamando findAll sem argumentos', async () => {
    const list = [{ studentRa: 123, courseId: 1, enrolledAt: mockDate }];
    repositoryMock.findAll.mockResolvedValue(list);

    const result = await service.findAll();
    expect(result).toEqual(list);
    expect(repositoryMock.findAll).toHaveBeenCalledTimes(1);
    expect(repositoryMock.findAll).toHaveBeenCalledWith();
  });

  it('8. Busca existente: retorna a matrícula consultada', async () => {
    const enrollment = { studentRa: 123, courseId: 1, enrolledAt: mockDate };
    repositoryMock.findOne.mockResolvedValue(enrollment);

    const result = await service.findOne(123, 1);
    expect(result).toEqual(enrollment);
    expect(repositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(repositoryMock.findOne).toHaveBeenCalledWith(123, 1);
  });
});