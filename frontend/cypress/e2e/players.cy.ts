describe('Players', () => {
  it('should redirect to login when not authenticated', () => {
    cy.visit('/players');
    cy.url().should('include', '/login');
  });
});
