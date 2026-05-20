describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login form', () => {
    cy.contains('Iniciar sesión');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Entrar');
  });

  it('should show error with invalid credentials', () => {
    cy.get('input[name="email"]').type('invalido@test.com');
    cy.get('input[name="password"]').type('malpassword');
    cy.get('button[type="submit"]').click();
    cy.get('ion-note[color="danger"]', { timeout: 10000 }).should('be.visible');
  });

  it('should navigate to register page', () => {
    cy.contains('Registrarse').click();
    cy.url().should('include', '/register');
  });
});
