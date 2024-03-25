/// <reference types="Cypress" />

describe("Login functionality", function () {
  it("Login Test using Conduit", function () {
    cy.visit("https://react-redux.realworld.io/"); // visiting the website
    cy.get('a[href="#login"').click(); // clicking on login button from
    cy.get('input[placeholder="Email"]').type("cypressdemo@gmail.com"); // typing email in input field
    cy.get('input[placeholder="Password"]').type("cypressdemo"); // typing password in password field
    cy.get('button[type="submit"]').click(); // submitting the form by clicking on submit button
    cy.get('a[href="#settings"]').click(); // going to settings page by clicking on setting link
    cy.get(".btn.btn-outline-danger").click(); // logging out by clicking logout button
  });
});
