import { TaskFactory } from '../../factories/task.factory';

const validData = {
  name: 'Disenar login',
  description: 'Crear formulario de autenticacion',
  area: 'Frontend',
  assignedTo: 'sebastian',
  teamId: 'team-001',
  projectId: 'proj-001',
};

describe('TaskFactory.create', () => {

  it('debe crear una tarea con estado PENDING por defecto', () => {
    const result = TaskFactory.create(validData);

    expect(result.name).toBe('Disenar login');
    expect(result.area).toBe('Frontend');
    expect(result.assignedTo).toBe('sebastian');
    expect(result.teamId).toBe('team-001');
    expect(result.projectId).toBe('proj-001');
    expect(result.status).toBe('PENDING');
  });

  it('debe lanzar error si el nombre esta vacio', () => {
    expect(() => {
      TaskFactory.create({ ...validData, name: '' });
    }).toThrow('nombre');
  });

  it('debe lanzar error si falta el projectId', () => {
    expect(() => {
      TaskFactory.create({ ...validData, projectId: '' });
    }).toThrow('Proyecto');
  });

  it('debe lanzar error si falta el area', () => {
    expect(() => {
      TaskFactory.create({ ...validData, area: '' });
    }).toThrow('área');
  });

  it('debe lanzar error si falta el assignedTo', () => {
    expect(() => {
      TaskFactory.create({ ...validData, assignedTo: '' });
    }).toThrow('obligatorio');
  });

  it('debe lanzar error si falta el teamId', () => {
    expect(() => {
      TaskFactory.create({ ...validData, teamId: '' });
    }).toThrow('obligatorio');
  });

  it('debe aceptar description vacia (campo opcional)', () => {
    const data = { ...validData, description: undefined };
    const result = TaskFactory.create(data as any);

    expect(result.name).toBe('Disenar login');
    expect(result.status).toBe('PENDING');
  });
});