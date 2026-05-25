describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login form', () => {
    cy.contains('Iniciar sesión');
    cy.get('ion-input[name="email"]').should('exist');
    cy.get('ion-input[name="password"]').should('exist');
    cy.contains('ion-button.submit-btn', 'Entrar').should('be.visible');
  });

  it('should stay on login page with invalid credentials', () => {
    cy.get('ion-input[name="email"]').type('invalido@test.com');
    cy.get('ion-input[name="password"]').type('malpassword');
    cy.get('ion-button.submit-btn').click();
    cy.url({ timeout: 15000 }).should('contain', '/login');
    cy.get('ion-button.submit-btn').should('not.be.disabled');
  });

  it('should navigate to register page', () => {
    cy.contains('.switch-btn', 'Regístrate').click();
    cy.url().should('include', '/register');
  });
});
