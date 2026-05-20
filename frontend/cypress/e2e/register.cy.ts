describe('Register', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display the register form', () => {
    cy.contains('Registrarse');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('input[name="confirmPassword"]').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Crear cuenta');
  });

  it('should show error when passwords do not match', () => {
    cy.get('input[name="email"]').type('test@test.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('different');
    cy.get('button[type="submit"]').click();
    cy.contains('Las contraseñas no coinciden');
  });

  it('should navigate to login page', () => {
    cy.contains('Iniciar sesión').click();
    cy.url().should('include', '/login');
  });
});
