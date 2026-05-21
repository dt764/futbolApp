describe('Listado de jugadores', () => {
  it('should be accessible without authentication', () => {
    cy.visit('/players');
    cy.url().should('not.include', '/login');
    cy.contains('Jugadores');
    cy.get('ion-list ion-item', { timeout: 10000 }).should('exist');
  });
});
