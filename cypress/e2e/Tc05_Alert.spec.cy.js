/// <reference types="Cypress" />

describe("Handling different Alerts", function () {
  it.only("Simple Alert", function () {
    cy.visit("https://the-internet.herokuapp.com/javascript_alerts"); // visiting the website page
    cy.contains("Click for JS Alert").click();
    cy.on("window:alert", (str) => {
      expect(str).to.equal("I am a JS Alert");
    });
    cy.get("#result").should("contain", "You successfully clicked an alert");
  });

  it.only("Confirmation Alert - Ok Button", function () {
    cy.visit("https://the-internet.herokuapp.com/javascript_alerts"); // visiting the website page
    cy.contains("Click for JS Confirm").click();
    cy.on("window:confirm", (str) => {
      expect(str).to.equal("I am a JS Confirm");
    });
    cy.get("#result").should("contain", "You clicked: Ok");
  });

  it.only("Confirmation Alert - Cancel Button", function () {
    cy.visit("https://the-internet.herokuapp.com/javascript_alerts"); // visiting the website page
    cy.contains("Click for JS Confirm").click();
    cy.on("window:confirm", (str) => {
      expect(str).to.equal("I am a JS Confirm");
      return false;
    });
    cy.get("#result").should("contain", "You clicked: Cancel");
  });

  it.only("Prompt Alert", function () {
    cy.visit("https://the-internet.herokuapp.com/javascript_alerts"); // visiting the website page
    cy.window().then(function ($win) {
      cy.stub($win, "prompt").returns("Hello Prompt Alert");
      cy.contains("Click for JS Prompt").click();
    });
    cy.get("#result").should("contain", "You entered: Hello Prompt Alert");
  });
});
