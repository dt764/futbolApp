describe('Register', () => {
  it('should show register page', () => {
    cy.visit('/register');
    cy.contains('Registrarse');
  });
});
