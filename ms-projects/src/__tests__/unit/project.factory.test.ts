import { ProjectFactory } from '../../factories/project.factory';

describe('ProjectFactory.create', () => {

  it('debe crear un proyecto con estado PLANNED por defecto', () => {
    const result = ProjectFactory.create('Sistema Web', 'Plataforma de gestion');

    expect(result.name).toBe('Sistema Web');
    expect(result.description).toBe('Plataforma de gestion');
    expect(result.status).toBe('PLANNED');
  });

  it('debe lanzar error si el nombre esta vacio', () => {
    expect(() => {
      ProjectFactory.create('', 'Descripcion valida');
    }).toThrow('El nombre es obligatorio');
  });

  it('debe lanzar error si el nombre es solo espacios', () => {
    expect(() => {
      ProjectFactory.create('   ', 'Descripcion valida');
    }).toThrow('El nombre es obligatorio');
  });

  it('debe lanzar error si la descripcion esta vacia', () => {
    expect(() => {
      ProjectFactory.create('Proyecto X', '');
    }).toThrow('La descripción es obligatoria');
  });

  it('debe lanzar error si la descripcion es solo espacios', () => {
    expect(() => {
      ProjectFactory.create('Proyecto X', '   ');
    }).toThrow('La descripción es obligatoria');
  });

  it('debe lanzar error si el nombre es null/undefined', () => {
    expect(() => {
      ProjectFactory.create(null as any, 'Descripcion');
    }).toThrow('El nombre es obligatorio');
  });

  it('debe lanzar error si la descripcion es null/undefined', () => {
    expect(() => {
      ProjectFactory.create('Proyecto X', undefined as any);
    }).toThrow('La descripción es obligatoria');
  });
});