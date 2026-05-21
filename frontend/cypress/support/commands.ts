declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<void>;
    typeInIonInput(label: string, value: string): Chainable<void>;
  }
}

export {};
