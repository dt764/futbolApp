import '@angular/compiler';
import { mount } from '@cypress/angular';

(Cypress.Commands as any).add('mount', mount);
