describe('Inserción de jugador desde formulario', () => {
  const email = `test-${Date.now()}@test.com`;
  const password = 'Test1234!';
  const mockUser = { uid: 'mock-id', email, displayName: 'Test', role: 'user' };

  beforeEach(() => {
    cy.session([email, password], () => {
      cy.intercept('GET', '**/api/auth/me*', { statusCode: 200, body: { user: mockUser } }).as('authMe');
      cy.visit('/register');
      cy.get('ion-input[name="email"]').type(email);
      cy.get('ion-input[name="password"]').type(password);
      cy.get('ion-input[name="confirmPassword"]').type(password);
      cy.get('ion-button.submit-btn').click();
      cy.url({ timeout: 20000 }).should('not.include', '/register');
    });
    cy.visit('/players/create');
  });

  it('should display the create form', () => {
    cy.contains('Nuevo jugador');
    cy.contains('ion-button.submit-btn', 'Crear jugador');
  });

  it('should create a player successfully', () => {
    cy.intercept('POST', '**/api/players/manual', { statusCode: 201, body: { player: { _id: 'new-id', name: 'Test Player' } } }).as('createPlayer');
    cy.get('ion-input').eq(0).click({ force: true }).find('input').type('Test Player');
    cy.get('ion-input').eq(3).click({ force: true }).find('input').type('Spain');
    cy.get('ion-input').eq(5).click({ force: true }).find('input').type('Forward');
    cy.get('ion-input').eq(8).click({ force: true }).find('input').type('Test FC');
    cy.get('ion-input').eq(9).click({ force: true }).find('input').type('Test League');
    cy.contains('ion-button.submit-btn', 'Crear jugador').click({ force: true });
    cy.wait('@createPlayer', { timeout: 10000 });
    cy.contains('Jugador creado', { timeout: 10000 }).should('be.visible');
  });
});
