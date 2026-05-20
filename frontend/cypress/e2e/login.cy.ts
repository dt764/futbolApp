describe('Login', () => {
  it('should show login page', () => {
    cy.visit('/login');
    cy.contains('Iniciar sesión');
  });
});
