Cypress.config('includeShadowDom', true);

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('ion-input[name="email"]').type(email);
    cy.get('ion-input[name="password"]').type(password);
    cy.get('ion-button.submit-btn').click();
    cy.url({ timeout: 10000 }).should('not.include', '/login');
  });
});

Cypress.Commands.add('typeInIonInput', (label: string, value: string) => {
  cy.contains('ion-item', label).find('ion-input').click({ force: true }).find('input').type(value);
});
