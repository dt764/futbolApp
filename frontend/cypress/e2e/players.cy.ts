describe('Listado de jugadores', () => {
  it('should be accessible without authentication', () => {
    cy.visit('/players');
    cy.url().should('not.include', '/login');
    cy.contains('Jugadores');
    cy.contains('Filtrar jugadores');
  });
});
