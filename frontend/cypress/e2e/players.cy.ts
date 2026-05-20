describe('Players', () => {
  it('should show players list', () => {
    cy.visit('/players');
    cy.contains('Jugadores');
  });
});
