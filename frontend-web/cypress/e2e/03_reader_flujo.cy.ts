/// <reference types="cypress" />

// ─────────────────────────────────────────────────────────────────────────────
//  SUITE 3: FLUJO DEL LECTOR
//  Cubre: login lector, ver reportes (resumen, proyectos, tareas,
//         grupos de trabajo, trabajadores), leer bitácoras
// ─────────────────────────────────────────────────────────────────────────────

describe('Suite 3 — Lector: módulo de reportes completo', () => {

  before(() => {
    cy.login('lector', 'lector123');
  });

  // ── 3.1 Login lector ────────────────────────────────────────────────────────
  it('3.1 Login como lector y ver badge Lector', () => {
    cy.visit('/');
    cy.get('input[placeholder="admin / lector / RUT del developer"]').type('lector');
    cy.get('input[placeholder="••••••••"]').type('lector123');
    cy.screenshot('20-login-lector-formulario');
    cy.get('button[type="submit"]').click();
    cy.contains('Lector').should('be.visible');
    cy.contains('Módulo de Reportes').should('be.visible');
    cy.screenshot('20-login-lector-exitoso');
  });

  // ── 3.2 Lector no tiene tabs de admin ni developer ──────────────────────────
  it('3.2 Lector NO ve tabs de Proyectos, Tareas, Equipos ni Mi Trabajo', () => {
    cy.get('nav').should('not.contain', '📁 Proyectos');
    cy.get('nav').should('not.contain', '✅ Tareas');
    cy.get('nav').should('not.contain', '🏢 Equipos');
    cy.get('nav').should('not.contain', '💻 Mi Trabajo');
    cy.screenshot('21-lector-sin-tabs-admin');
  });

  // ── 3.3 Ver resumen con contadores ──────────────────────────────────────────
  it('3.3 Ver resumen general con contadores de proyectos, tareas y equipos', () => {
    cy.contains('button', '📊 Resumen').click();
    cy.contains('📁 Proyectos').should('be.visible');
    cy.contains('✅ Tareas').should('be.visible');
    cy.contains('🏢 Equipos').should('be.visible');
    cy.screenshot('22-lector-resumen-contadores');
  });

  // ── 3.4 Ver proyectos ────────────────────────────────────────────────────────
  it('3.4 Ver listado de proyectos con estado', () => {
    cy.contains('button', '📁 Proyectos').click();
    cy.contains('Proyectos').should('be.visible');
    // Verificar que la tabla tiene columnas correctas
    cy.contains('th', 'Nombre').should('be.visible');
    cy.contains('th', 'Estado').should('be.visible');
    cy.contains('th', 'Área').should('be.visible');
    cy.screenshot('23-lector-lista-proyectos');
  });

  // ── 3.5 Ver tareas agrupadas por proyecto ────────────────────────────────────
  it('3.5 Ver tareas agrupadas por proyecto', () => {
    cy.contains('button', '✅ Tareas').click();
    cy.contains('Tareas por Proyecto').should('be.visible');
    cy.screenshot('24-lector-tareas-por-proyecto');
  });

  // ── 3.6 Leer bitácora de una tarea (solo lectura) ───────────────────────────
  it('3.6 Leer bitácora de una tarea — no puede agregar entradas', () => {
    // Buscar botón de bitácora con entradas
    cy.get('button').contains(/📋 Ver bitácora/).first().then($btn => {
      if ($btn.length > 0) {
        cy.wrap($btn).click();
        cy.screenshot('25-lector-bitacora-abierta');

        // No debe haber textarea para agregar
        cy.get('textarea').should('not.exist');
        cy.get('button').contains('+ Agregar entrada').should('not.exist');

        // Solo botón Cerrar
        cy.contains('button', 'Cerrar').should('be.visible');
        cy.screenshot('25-lector-bitacora-solo-lectura');
        cy.contains('button', 'Cerrar').click();
      } else {
        cy.log('No hay tareas con bitácora — crear entradas desde admin/developer primero');
        cy.screenshot('25-lector-sin-bitacoras');
      }
    });
  });

  // ── 3.7 Ver equipos con integrantes ─────────────────────────────────────────
  it('3.7 Ver equipos con lista de integrantes y roles', () => {
    cy.contains('button', '🏢 Equipos').click();
    cy.contains('Equipos').should('be.visible');
    cy.screenshot('26-lector-lista-equipos');

    // Verificar que muestra integrantes
    cy.contains('th', 'Integrante').should('be.visible');
    cy.contains('th', 'Rol en Equipo').should('be.visible');
    cy.screenshot('26-lector-equipos-con-integrantes');
  });

  // ── 3.8 Ver tabla de trabajadores ───────────────────────────────────────────
  it('3.8 Ver tabla completa de trabajadores con área y equipo', () => {
    cy.contains('button', '👥 Trabajadores').click();
    cy.contains('Trabajadores').should('be.visible');
    cy.screenshot('27-lector-tabla-trabajadores');

    // Verificar columnas de la tabla
    cy.contains('th', 'Nombre Completo').should('be.visible');
    cy.contains('th', 'RUT').should('be.visible');
    cy.contains('th', 'Cargo').should('be.visible');
    cy.contains('th', 'Área').should('be.visible');
    cy.contains('th', 'Equipo').should('be.visible');
    cy.contains('th', 'Fecha Ingreso').should('be.visible');
    cy.contains('th', 'ID Trabajador').should('be.visible');
    cy.screenshot('27-lector-trabajadores-columnas-completas');
  });

  // ── 3.9 Lector no puede crear, editar ni eliminar ───────────────────────────
  it('3.9 Verificar que no existen botones de creación o edición', () => {
    // En ninguna pestaña debe haber botones de acción
    cy.contains('button', '+ Nuevo').should('not.exist');
    cy.contains('button', '+ Crear').should('not.exist');
    cy.contains('button', 'Eliminar').should('not.exist');
    cy.screenshot('28-lector-sin-botones-accion');
  });

  // ── 3.10 Actualizar datos con botón Actualizar ───────────────────────────────
  it('3.10 Botón Actualizar recarga los datos correctamente', () => {
    cy.contains('button', '↻ Actualizar').click();
    cy.contains('Módulo de Reportes').should('be.visible');
    cy.screenshot('29-lector-datos-actualizados');
  });

  after(() => {
    cy.logout();
  });
});