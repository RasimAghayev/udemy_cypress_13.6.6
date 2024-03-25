/// <reference types="Cypress" />

describe.only("Radio button Functionality", function () {
  it("Handling different radio button", function () {
    //Basic radio button
    cy.visit("https://demos.jquerymobile.com/1.4.5/checkboxradio-radio/"); // visiting the website page
    cy.get("#radio-choice-0a").should("not.be.checked").click({ force: true }); // checking if first radio is not selected and clicking on it
    cy.get("#radio-choice-0b").should("not.be.checked").click({ force: true });

    //Modern Radio button
    cy.get("#radio-choice-h-2a").should("be.checked").click({ force: true });
    cy.get("#radio-choice-h-2b")
      .should("not.be.checked")
      .click({ force: true });
    cy.get("#radio-choice-h-2c")
      .should("not.be.checked")
      .click({ force: true });
  });
});
