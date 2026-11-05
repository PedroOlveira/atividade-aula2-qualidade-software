import { CoursesService } from '../../../src/modules/courses/courses.service';
import { CourseRepository } from '../../../src/modules/courses/courses.repository';

describe('CoursesService', () => {
  let repositoryMock: jest.Mocked<CourseRepository>;
  let service: CoursesService;

  beforeEach(() => {
    repositoryMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };
    service = new CoursesService(repositoryMock);
  });

  it('1. Criação válida: cria disciplina com sucesso', async () => {
    const input = { name: 'Qualidade' };
    const created = { id: 1, name: 'Qualidade' };
    repositoryMock.create.mockResolvedValue(created);

    const result = await service.create(input);

    expect(repositoryMock.create).toHaveBeenCalledTimes(1);
    expect(repositoryMock.create).toHaveBeenCalledWith({ name: 'Qualidade' });
    expect(result).toEqual(created);
  });

  test.each([
    [null],
    [{}],
    [{ name: 'A' }],
  ])('2. Criação inválida: lança erro 400 para %p e não chama o repositório', async (input) => {
    await expect(service.create(input as any)).rejects.toMatchObject({ statusCode: 400 });
    expect(repositoryMock.create).not.toHaveBeenCalled();
  });

  it('3. Nome duplicado: lança erro 409 quando o banco retorna violação única', async () => {
    repositoryMock.create.mockRejectedValue({ code: '23505' });
    await expect(service.create({ name: 'Qualidade' })).rejects.toMatchObject({ statusCode: 409 });
  });

  it('4. Listagem com stub: retorna a lista de disciplinas', async () => {
    const courses = [{ id: 1, name: 'Qualidade' }];
    repositoryMock.findAll.mockResolvedValue(courses);

    const result = await service.findAll();
    expect(result).toEqual(courses);
    expect(repositoryMock.findAll).toHaveBeenCalledTimes(1);
  });

  it('5. Busca existente: retorna o registro da disciplina consultada', async () => {
    const course = { id: 123, name: 'Qualidade' };
    repositoryMock.findOne.mockResolvedValue(course);

    const result = await service.findOne(123);
    expect(result).toEqual(course);
    expect(repositoryMock.findOne).toHaveBeenCalledWith(123);
  });

  it('6. Busca inexistente: lança erro 404', async () => {
    repositoryMock.findOne.mockResolvedValue(undefined);
    await expect(service.findOne(123)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('7. Identificador inválido: lança erro 400 e não chama o repositório', async () => {
    await expect(service.findOne(0)).rejects.toMatchObject({ statusCode: 400 });
    expect(repositoryMock.findOne).not.toHaveBeenCalled();
  });

  describe('8. Falhas inesperadas', () => {
    const dbError = new Error('Erro de conexão inesperado');

    it('propaga erro no create', async () => {
      repositoryMock.create.mockRejectedValue(dbError);
      await expect(service.create({ name: 'Qualidade' })).rejects.toBe(dbError);
    });

    it('propaga erro no findAll', async () => {
      repositoryMock.findAll.mockRejectedValue(dbError);
      await expect(service.findAll()).rejects.toBe(dbError);
    });

    it('propaga erro no findOne', async () => {
      repositoryMock.findOne.mockRejectedValue(dbError);
      await expect(service.findOne(1)).rejects.toBe(dbError);
    });
  });

  it('9. Uso de spy: observa a chamada do método findOne', async () => {
    const stubRepository: CourseRepository = {
      create: async () => ({ id: 1, name: 'Teste' }),
      findAll: async () => [],
      findOne: async (id: number) => ({ id, name: 'Algoritmos' }),
    };
    const spy = jest.spyOn(stubRepository, 'findOne');
    const spyService = new CoursesService(stubRepository);

    const result = await spyService.findOne(1);
    expect(result).toEqual({ id: 1, name: 'Algoritmos' });
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('10. Campos extras: ignora campos adicionais ao enviar ao repositório', async () => {
    repositoryMock.create.mockResolvedValue({ id: 1, name: 'Qualidade' });
    await service.create({ name: 'Qualidade', extra: true } as any);
    expect(repositoryMock.create).toHaveBeenCalledWith({ name: 'Qualidade' });
  });
});