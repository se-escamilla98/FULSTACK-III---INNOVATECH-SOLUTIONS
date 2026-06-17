import { TeamFactory } from '../../factories/team.factory';

describe('TeamFactory.create', () => {

  it('debe crear un equipo con estado ACTIVE por defecto', () => {
    const result = TeamFactory.create('Equipo Alpha', 'Equipo de desarrollo', 'TI', 'leader-001');

    expect(result.name).toBe('Equipo Alpha');
    expect(result.description).toBe('Equipo de desarrollo');
    expect(result.area).toBe('TI');
    expect(result.leaderId).toBe('leader-001');
    expect(result.status).toBe('ACTIVE');
  });

  it('debe lanzar error si el nombre esta vacio', () => {
    expect(() => {
      TeamFactory.create('', 'Desc', 'TI', 'leader-001');
    }).toThrow('nombre');
  });

  it('debe lanzar error si la descripcion esta vacia', () => {
    expect(() => {
      TeamFactory.create('Equipo', '', 'TI', 'leader-001');
    }).toThrow('descripción');
  });

  it('debe lanzar error si el area esta vacia', () => {
    expect(() => {
      TeamFactory.create('Equipo', 'Desc', '', 'leader-001');
    }).toThrow('área');
  });

  it('debe lanzar error si el leaderId esta vacio', () => {
    expect(() => {
      TeamFactory.create('Equipo', 'Desc', 'TI', '');
    }).toThrow('líder');
  });

  it('debe lanzar error si el nombre es solo espacios', () => {
    expect(() => {
      TeamFactory.create('   ', 'Desc', 'TI', 'leader-001');
    }).toThrow('nombre');
  });
});