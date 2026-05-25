describe('Register', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display the register form', () => {
    cy.contains('Registrarse');
    cy.get('ion-input[name="email"]').should('exist');
    cy.get('ion-input[name="password"]').should('exist');
    cy.get('ion-input[name="confirmPassword"]').should('exist');
    cy.contains('ion-button.submit-btn', 'Crear cuenta').should('be.visible');
  });

  it('should show error when passwords do not match', () => {
    cy.get('ion-input[name="email"]').type('test@test.com');
    cy.get('ion-input[name="password"]').type('password123');
    cy.get('ion-input[name="confirmPassword"]').type('different');
    cy.get('ion-button.submit-btn').click();
    cy.contains('Las contraseñas no coinciden');
  });

  it('should navigate to login page', () => {
    cy.contains('.switch-btn', 'Inicia sesión').click();
    cy.url().should('include', '/login');
  });
});
