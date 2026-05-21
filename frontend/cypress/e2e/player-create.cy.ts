describe('Inserción de jugador desde formulario', () => {
  beforeEach(() => {
    cy.login('test@test.com', 'password123');
    cy.visit('/players/create');
  });

  it('should display the create form', () => {
    cy.contains('Nuevo jugador');
    cy.contains('Datos del jugador');
    cy.contains('Foto');
    cy.contains('Ubicación');
    cy.contains('ion-button', 'Crear jugador');
  });

  it('should create a player successfully', () => {
    cy.typeInIonInput('Nombre completo *', 'Test Player');
    cy.typeInIonInput('Nacionalidad', 'Spain');
    cy.typeInIonInput('Posición', 'Forward');
    cy.typeInIonInput('Equipo', 'Test FC');
    cy.typeInIonInput('Liga', 'Test League');

    cy.contains('ion-button', 'Crear jugador').click();

    cy.contains('Jugador creado correctamente', { timeout: 10000 });
  });

  it('should disable submit when name is empty', () => {
    cy.contains('ion-button', 'Crear jugador').should('be.disabled');
  });
});
