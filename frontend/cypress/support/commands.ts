declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): void;
    typeInIonInput(label: string, value: string): void;
  }
}

export {};
