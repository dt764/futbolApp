import { defineConfig } from 'cypress';
import angular from '@analogjs/vite-plugin-angular';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    video: false,
    screenshotOnRunFailure: true,
  },
  component: {
    devServer: {
      framework: 'angular',
      bundler: 'vite',
    },
    supportFile: 'cypress/support/component.ts',
    specPattern: 'src/**/*.cy.ts',
  },
});
