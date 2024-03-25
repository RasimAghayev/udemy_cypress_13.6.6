/// <reference types="Cypress" />

describe("CheckBox Functionality", function () {
  it("Handling different check boxes", function () {
    //Basic radio button
    cy.visit("https://demos.jquerymobile.com/1.4.5/checkboxradio-checkbox/"); // visiting the website page
    cy.get("#checkbox-v-2a")
      .should("not.be.checked")
      .check({ force: true })
      .should("be.checked");
    cy.get("#checkbox-v-2c")
      .should("not.be.checked")
      .check({ force: true })
      .should("be.checked");
  });
});
