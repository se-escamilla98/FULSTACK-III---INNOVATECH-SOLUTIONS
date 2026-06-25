/// <reference types="cypress" />

// ─── Comandos personalizados Innovatech Solutions ─────────────────────────────

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/');
  cy.get('input[placeholder="admin / lector / RUT del developer"]')
    .clear().type(username);
  cy.get('input[placeholder="••••••••"]')
    .clear().type(password);
  cy.get('button[type="submit"]').click();
  cy.get('header').should('be.visible');
});

Cypress.Commands.add('logout', () => {
  cy.contains('button', 'Cerrar Sesión').click();
  cy.get('input[placeholder="admin / lector / RUT del developer"]')
    .should('be.visible');
});

Cypress.Commands.add('goToTab', (tab: string) => {
  cy.get('nav').contains('button', tab).click();
  cy.wait(500);
});

export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      goToTab(tab: string): Chainable<void>;
    }
  }
}