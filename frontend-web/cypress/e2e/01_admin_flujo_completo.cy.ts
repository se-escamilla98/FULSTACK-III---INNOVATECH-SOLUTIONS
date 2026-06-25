/// <reference types="cypress" />

// ─────────────────────────────────────────────────────────────────────────────
//  SUITE 1: FLUJO COMPLETO DEL ADMINISTRADOR
//  Cubre: login admin, crear empleado, crear equipo con integrantes,
//         crear proyecto con equipo asignado, crear tarea desde TasksView
// ─────────────────────────────────────────────────────────────────────────────

describe('Suite 1 — Administrador: flujo completo', () => {

  // Datos de prueba únicos por ejecución para evitar conflictos
  const ts          = Date.now();
  const empleado1   = { firstName: 'Carlos', lastName: 'Mendoza', rut: `1${ts.toString().slice(-7)}-5`, position: 'Desarrollador', hireDate: '2026-01-15', password: 'dev123' };
  const empleado2   = { firstName: 'Ana', lastName: 'Torres', rut: `2${ts.toString().slice(-7)}-k`, position: 'QA Tester', hireDate: '2026-02-10', password: 'dev456' };
  const equipo      = { nombre: `Equipo-${ts}`, descripcion: 'Equipo de prueba Cypress', area: 'Backend' };
  const proyecto    = { nombre: `Proyecto-${ts}`, descripcion: 'Proyecto de prueba Cypress', area: 'Backend' };
  const tarea       = { nombre: `Tarea-${ts}`, descripcion: 'Tarea creada por Cypress', area: 'Backend' };

  before(() => {
    cy.login('admin', 'admin123');
  });

  // ── 1.1 Login admin ─────────────────────────────────────────────────────────
  it('1.1 Login como admin y verificar badge de rol', () => {
    cy.visit('/');
    cy.get('input[placeholder="admin / lector / RUT del developer"]').type('admin');
    cy.get('input[placeholder="••••••••"]').type('admin123');
    cy.screenshot('01-login-admin-formulario');
    cy.get('button[type="submit"]').click();
    cy.contains('Admin').should('be.visible');
    cy.contains('Hola, Administrador').should('be.visible');
    cy.screenshot('01-login-admin-exitoso');
  });

  // ── 1.2 Crear empleado 1 ────────────────────────────────────────────────────
  it('1.2 Crear empleado 1 (Carlos Mendoza) con clave de usuario', () => {
    cy.goToTab('🏢 Equipos');
    cy.contains('button', '👥 Gestionar Empleados').click();
    cy.screenshot('02-panel-empleados-abierto');

    cy.get('input[placeholder="Primer nombre *"]').type(empleado1.firstName);
    cy.get('input[placeholder="Apellido paterno *"]').type(empleado1.lastName);
    cy.get('input[placeholder="RUT (ej: 12.345.678-9) *"]').type(empleado1.rut);
    cy.get('select').contains('option', 'Cargo *').parent().select(empleado1.position);
    cy.get('input[type="date"]').first().type(empleado1.hireDate);
    cy.get('input[type="password"]').type(empleado1.password);
    cy.screenshot('02-formulario-empleado-1-completo');

    cy.contains('button', '+ Registrar Empleado').click();
    cy.contains(`${empleado1.firstName}`, { timeout: 8000 }).should('be.visible');
    cy.screenshot('02-empleado-1-creado');
  });

  // ── 1.3 Crear empleado 2 ────────────────────────────────────────────────────
  it('1.3 Crear empleado 2 (Ana Torres) con clave de usuario', () => {
    cy.get('input[placeholder="Primer nombre *"]').type(empleado2.firstName);
    cy.get('input[placeholder="Apellido paterno *"]').type(empleado2.lastName);
    cy.get('input[placeholder="RUT (ej: 12.345.678-9) *"]').type(empleado2.rut);
    cy.get('select').contains('option', 'Cargo *').parent().select(empleado2.position);
    cy.get('input[type="date"]').first().type(empleado2.hireDate);
    cy.get('input[type="password"]').type(empleado2.password);

    cy.contains('button', '+ Registrar Empleado').click();
    cy.contains(`${empleado2.firstName}`, { timeout: 8000 }).should('be.visible');
    cy.screenshot('03-empleado-2-creado');
  });

  // ── 1.4 Crear equipo con líder e integrantes ────────────────────────────────
  it('1.4 Crear equipo con líder e integrantes desde el modal', () => {
    cy.contains('button', '+ Nuevo Equipo').click();
    cy.screenshot('04-modal-nuevo-equipo-abierto');

    // Datos del equipo
    cy.get('input[placeholder="Nombre del equipo"]').type(equipo.nombre);
    cy.get('textarea[placeholder="Descripción del equipo"]').type(equipo.descripcion);
    cy.get('select').contains('option', 'Backend').parent().first().select(equipo.area);

    // Seleccionar líder (Carlos Mendoza)
    cy.get('select').contains('option', empleado1.firstName).parent().select(`${empleado1.firstName} ${empleado1.lastName} (${empleado1.position})`);

    // Agregar Ana Torres como integrante
    cy.get('select[class]').contains('option', empleado2.firstName).parent().select(`${empleado2.firstName} ${empleado2.lastName} (${empleado2.position})`);
    cy.get('select').contains('option', 'Frontend Developer').parent().last().select('QA Engineer');
    cy.contains('button', '+').last().click();
    cy.contains(empleado2.firstName).should('be.visible');
    cy.screenshot('04-modal-equipo-con-integrante');

    cy.contains('button', 'Crear Equipo').click();
    cy.contains(equipo.nombre, { timeout: 8000 }).should('be.visible');
    cy.screenshot('04-equipo-creado-con-integrantes');
  });

  // ── 1.5 Verificar que el líder aparece como miembro ─────────────────────────
  it('1.5 Verificar que el líder se agrega automáticamente como Tech Lead', () => {
    cy.contains(equipo.nombre).parents('[style]').first().within(() => {
      cy.contains('Tech Lead').should('be.visible');
      cy.contains(empleado1.firstName).should('be.visible');
    });
    cy.screenshot('05-lider-como-tech-lead');
  });

  // ── 1.6 Crear proyecto y asignar equipo ─────────────────────────────────────
  it('1.6 Crear proyecto y asignar equipo desde Proyectos', () => {
    cy.goToTab('📁 Proyectos');
    cy.contains('button', '+ Nuevo Proyecto').click();
    cy.screenshot('06-modal-nuevo-proyecto');

    cy.get('input[placeholder="Nombre del proyecto"]').type(proyecto.nombre);
    cy.get('textarea[placeholder="Descripción del proyecto"]').type(proyecto.descripcion);
    cy.get('select').contains('option', 'Backend').parent().first().select(proyecto.area);
    cy.get('select').contains('option', equipo.nombre).parent().select(equipo.nombre);
    cy.screenshot('06-formulario-proyecto-completo');

    cy.contains('button', 'Crear Proyecto').click();
    cy.contains(proyecto.nombre, { timeout: 8000 }).should('be.visible');
    cy.screenshot('06-proyecto-creado-con-equipo');
  });

  // ── 1.7 Buscar proyecto por nombre ──────────────────────────────────────────
  it('1.7 Buscar proyecto por nombre en la barra de búsqueda', () => {
    cy.get('input[placeholder="Buscar por nombre o ID..."]').type(proyecto.nombre);
    cy.contains(proyecto.nombre).should('be.visible');
    cy.screenshot('07-busqueda-proyecto-por-nombre');
    cy.get('input[placeholder="Buscar por nombre o ID..."]').clear();
  });

  // ── 1.8 Crear tarea desde TasksView ─────────────────────────────────────────
  it('1.8 Crear tarea asignada a un miembro del equipo', () => {
    cy.goToTab('✅ Tareas');
    cy.get('select').contains('option', proyecto.nombre).parent().select(proyecto.nombre);
    cy.wait(1000);
    cy.screenshot('08-tareas-proyecto-seleccionado');

    cy.contains('button', '+ Nueva Tarea').click();
    cy.get('input[placeholder="Nombre de la tarea"]').type(tarea.nombre);
    cy.get('textarea[placeholder="Descripción de la tarea"]').type(tarea.descripcion);
    cy.get('select').contains('option', 'Backend').parent().first().select(tarea.area);

    // Seleccionar equipo
    cy.get('select').contains('option', equipo.nombre).parent().select(equipo.nombre);
    cy.wait(500);

    // Seleccionar miembro (Ana Torres)
    cy.get('select').contains('option', empleado2.firstName).parent().select(`${empleado2.firstName} ${empleado2.lastName} — QA Engineer`);
    cy.screenshot('08-formulario-tarea-completo');

    cy.contains('button', 'Crear Tarea').click();
    cy.contains(tarea.nombre, { timeout: 8000 }).should('be.visible');
    cy.screenshot('08-tarea-creada-exitosamente');
  });

  // ── 1.9 Cambiar estado de tarea ──────────────────────────────────────────────
  it('1.9 Cambiar estado de tarea a IN_PROGRESS', () => {
    cy.contains(tarea.nombre).parents('[style]').first().within(() => {
      cy.get('select').select('IN_PROGRESS');
    });
    cy.contains('🔄 En Progreso').should('be.visible');
    cy.screenshot('09-tarea-estado-en-progreso');
  });

  // ── 1.10 Agregar entrada a bitácora ─────────────────────────────────────────
  it('1.10 Agregar entrada a la bitácora de la tarea', () => {
    cy.contains(tarea.nombre).parents('[style]').first().within(() => {
      cy.contains('button', '📋 Bitácora').click();
    });
    cy.screenshot('10-bitacora-abierta-admin');

    cy.get('textarea[placeholder="Escribe una entrada en la bitácora..."]')
      .type('Tarea iniciada por el administrador desde Cypress E2E');
    cy.contains('button', '+ Agregar entrada').click();
    cy.contains('Tarea iniciada por el administrador').should('be.visible');
    cy.screenshot('10-bitacora-entrada-agregada-admin');

    cy.contains('button', 'Cerrar').click();
  });

  after(() => {
    cy.logout();
  });
});