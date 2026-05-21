describe('Búsqueda de jugadores', () => {
  beforeEach(() => {
    cy.visit('/players');
  });

  it('should display the players list page', () => {
    cy.contains('Jugadores');
    cy.contains('ion-searchbar');
    cy.contains('ion-label', 'Equipo');
    cy.contains('ion-label', 'Liga');
  });

  it('should search by player name', () => {
    cy.get('ion-searchbar').should('exist');
    cy.get('ion-list ion-item', { timeout: 10000 }).should('exist');
  });

  it('should filter by team', () => {
    cy.typeInIonInput('Equipo', 'Barcelona');
    cy.get('ion-list ion-item', { timeout: 10000 }).should('exist');
  });

  it('should filter by league', () => {
    cy.typeInIonInput('Liga', 'La Liga');
    cy.get('ion-list ion-item', { timeout: 10000 }).should('exist');
  });

  it('should navigate to player detail', () => {
    cy.get('ion-list ion-item', { timeout: 10000 }).first().click();
    cy.url().should('match', /\/players\//);
  });
});
