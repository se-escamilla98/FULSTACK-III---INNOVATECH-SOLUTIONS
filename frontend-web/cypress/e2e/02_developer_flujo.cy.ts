/// <reference types="cypress" />

// ─────────────────────────────────────────────────────────────────────────────
//  SUITE 2: FLUJO DEL DEVELOPER
// ─────────────────────────────────────────────────────────────────────────────

describe('Suite 2 — Developer: proyectos, tareas y bitácora', () => {

  const DEV_RUT      = Cypress.env('devRut')      || '12.345.678-9';
  const DEV_PASSWORD = Cypress.env('devPassword') || 'dev123';

  before(() => {
    cy.login(DEV_RUT, DEV_PASSWORD);
  });

  // ── 2.1 Login developer ─────────────────────────────────────────────────────
  it('2.1 Login como developer con RUT y ver badge Developer', () => {
    cy.visit('/');
    cy.get('input[placeholder="admin / lector / RUT del developer"]')
      .type(DEV_RUT);
    cy.get('input[placeholder="••••••••"]').type(DEV_PASSWORD);
    cy.screenshot('11-login-developer-formulario');
    cy.get('button[type="submit"]').click();
    cy.contains('Developer').should('be.visible');
    cy.screenshot('11-login-developer-exitoso');
  });

  // ── 2.2 Ver solo proyectos del equipo asignado ──────────────────────────────
  it('2.2 Developer ve solo los proyectos de su equipo', () => {
    cy.contains('Mis Proyectos').should('be.visible');
    cy.contains('ID empleado:').should('be.visible');
    cy.screenshot('12-developer-mis-proyectos');
  });

  // ── 2.3 No tiene tabs de admin ───────────────────────────────────────────────
  it('2.3 Developer no ve tabs de admin ni Reader', () => {
    cy.get('nav').should('not.contain', '📁 Proyectos');
    cy.get('nav').should('not.contain', '✅ Tareas');
    cy.get('nav').should('not.contain', '🏢 Equipos');
    cy.screenshot('12-developer-sin-tabs-admin');
  });

  // ── 2.4 Entrar a un proyecto ────────────────────────────────────────────────
  it('2.4 Entrar a un proyecto asignado y ver kanban', () => {
    cy.contains('Ver tareas →').first().click();
    cy.contains('Mis tareas').should('be.visible');
    cy.screenshot('13-developer-kanban-tareas');
  });

  // ── 2.5 Crear tarea ─────────────────────────────────────────────────────────
  it('2.5 Crear tarea — se asigna automáticamente al developer', () => {
    const tareaNombre = `Tarea-Dev-${Date.now()}`;

    cy.contains('button', '+ Nueva Tarea').click();
    cy.screenshot('14-developer-modal-nueva-tarea');

    cy.get('input[placeholder="Ej: Implementar endpoint de login"]')
      .type(tareaNombre);
    cy.get('textarea[placeholder="Describe brevemente la tarea..."]')
      .type('Tarea creada por developer en Cypress E2E');
    cy.get('select').contains('option', 'Backend').parent().select('Backend');
    cy.screenshot('14-developer-formulario-tarea-completo');

    cy.contains('button', 'Crear Tarea').click();
    cy.contains(tareaNombre, { timeout: 8000 }).should('be.visible');
    cy.screenshot('14-developer-tarea-creada');
  });

  // ── 2.6 Tarea propia tiene "Mi tarea" ───────────────────────────────────────
  it('2.6 Tarea propia muestra badge "Mi tarea" y borde verde', () => {
    cy.contains('✓ Mi tarea').should('be.visible');
    cy.screenshot('15-developer-tarea-propia-marcada');
  });

  // ── 2.7 Cambiar estado de tarea propia ──────────────────────────────────────
  it('2.7 Developer puede cambiar estado de su propia tarea', () => {
    cy.contains('✓ Mi tarea').parents('[style]').first().within(() => {
      cy.contains('button', 'Cambiar estado').click();
      cy.get('select').select('IN_PROGRESS');
      cy.contains('button', '✓').click();
    });
    cy.contains('Estado actualizado').should('be.visible');
    cy.screenshot('15-developer-estado-cambiado');
  });

  // ── 2.8 Tarea ajena muestra "Solo lectura" ──────────────────────────────────
  it('2.8 Developer NO puede cambiar estado de tarea ajena', () => {
    cy.get('body').then($body => {
      if ($body.text().includes('Solo lectura')) {
        cy.contains('Solo lectura').should('be.visible');
        cy.contains('Solo lectura').parents('[style]').first()
          .should('not.contain', 'Cambiar estado');
        cy.screenshot('16-developer-tarea-ajena-solo-lectura');
      } else {
        cy.log('No hay tareas ajenas visibles — solo hay tareas propias');
        cy.screenshot('16-developer-sin-tareas-ajenas');
      }
    });
  });

  // ── 2.9 Agregar bitácora en tarea propia ────────────────────────────────────
  it('2.9 Developer agrega entrada en bitácora de su tarea', () => {
    cy.contains('✓ Mi tarea').parents('[style]').first().within(() => {
      cy.contains('button', '📋').click();
    });
    cy.screenshot('17-developer-bitacora-propia-abierta');

    cy.get('textarea[placeholder="Escribe una entrada en la bitácora..."]')
      .type('Avance: implementando la funcionalidad de autenticación JWT');
    cy.contains('button', '+ Agregar entrada').click();
    cy.contains('Avance: implementando la funcionalidad').should('be.visible');
    cy.screenshot('17-developer-bitacora-entrada-agregada');

    cy.contains('button', 'Cerrar').click();
  });

  // ── 2.10 Bitácora de tarea ajena es solo lectura ─────────────────────────────
  it('2.10 Developer puede VER bitácora de tarea ajena pero NO agregar', () => {
    cy.get('body').then($body => {
      if ($body.text().includes('Solo lectura')) {
        cy.contains('Solo lectura').parents('[style]').first().within(() => {
          cy.contains('button', '📋').click();
        });
        cy.get('textarea[placeholder="Escribe una entrada en la bitácora..."]')
          .should('not.exist');
        cy.screenshot('18-developer-bitacora-ajena-solo-lectura');
        cy.contains('button', 'Cerrar').click();
      } else {
        cy.log('No hay tareas ajenas — test omitido');
        cy.screenshot('18-sin-tareas-ajenas');
      }
    });
  });

  // ── 2.11 Volver a lista de proyectos ────────────────────────────────────────
  it('2.11 Volver a lista de proyectos con botón Volver', () => {
    cy.contains('button', '← Volver').click();
    cy.contains('Mis Proyectos').should('be.visible');
    cy.screenshot('19-developer-volver-proyectos');
  });

  after(() => {
    cy.logout();
  });
});