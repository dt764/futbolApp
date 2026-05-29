describe('Búsqueda de jugadores', () => {
  beforeEach(() => {
    cy.visit('/players');
  });

  it('should display the players list page', () => {
    cy.contains('Jugadores');
    cy.contains('.filter-title', 'Filtrar jugadores');
  });

  it('should show filter inputs', () => {
    cy.get('ion-input[label="Nombre"]').should('exist');
    cy.get('ion-input[label="Equipo"]').should('exist');
    cy.get('ion-input[label="Liga"]').should('exist');
  });
});
