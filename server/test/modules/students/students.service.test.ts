import { StudentsService } from '../../../src/modules/students/students.service';
import { StudentRepository } from '../../../src/modules/students/students.repository';

describe('StudentsService', () => {
  let repositoryMock: jest.Mocked<StudentRepository>;
  let service: StudentsService;

  beforeEach(() => {
    repositoryMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };
    service = new StudentsService(repositoryMock);
  });

  it('1. Criação válida: cria aluno com sucesso', async () => {
    const input = { ra: 123, name: 'Ana' };
    repositoryMock.create.mockResolvedValue(input);

    const result = await service.create(input);
    expect(repositoryMock.create).toHaveBeenCalledWith({ ra: 123, name: 'Ana' });
    expect(result).toEqual(input);
  });

  it('2. RA inválido: lança erro 400 e não chama create', async () => {
    await expect(service.create({ ra: 0, name: 'Ana' })).rejects.toMatchObject({ statusCode: 400 });
    expect(repositoryMock.create).not.toHaveBeenCalled();
  });

  it('3. RA duplicado: lança erro 409 ao ocorrer erro de unicidade', async () => {
    repositoryMock.create.mockRejectedValue({ code: '23505' });
    await expect(service.create({ ra: 123, name: 'Ana' })).rejects.toMatchObject({ statusCode: 409 });
  });

  it('4. Aluno inexistente: lança erro 404', async () => {
    repositoryMock.findOne.mockResolvedValue(undefined);
    await expect(service.findOne(123)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('5. Falha inesperada na criação: propaga a mesma instância de erro', async () => {
    const err = new Error('Falha no BD');
    repositoryMock.create.mockRejectedValue(err);
    await expect(service.create({ ra: 123, name: 'Ana' })).rejects.toBe(err);
  });

  it('6. Listagem: retorna lista e chama findAll exatamente uma vez sem argumentos', async () => {
    const students = [{ ra: 123, name: 'Ana' }];
    repositoryMock.findAll.mockResolvedValue(students);

    const result = await service.findAll();
    expect(result).toEqual(students);
    expect(repositoryMock.findAll).toHaveBeenCalledTimes(1);
    expect(repositoryMock.findAll).toHaveBeenCalledWith();
  });

  it('7. Aluno existente: busca por RA e retorna o registro', async () => {
    const student = { ra: 123, name: 'Ana' };
    repositoryMock.findOne.mockResolvedValue(student);

    const result = await service.findOne(123);
    expect(result).toEqual(student);
    expect(repositoryMock.findOne).toHaveBeenCalledTimes(1);
    expect(repositoryMock.findOne).toHaveBeenCalledWith(123);
  });
});