// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add("conduItLogin", (email, password) => {
  cy.visit("/"); // visiting the website
  cy.get('a[href="#login"').click(); // clicking on login button from
  cy.get('input[placeholder="Email"]').type(email); // typing email in input field
  cy.get('input[placeholder="Password"]').type(password); // typing password in password field
  cy.get('button[type="submit"]').click(); // submitting the form by clicking on submit button
});
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
