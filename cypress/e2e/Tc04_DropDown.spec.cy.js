/// <reference types="Cypress" />

describe("Dropdown Functionality", function () {
  it("Handling static dropdown", function () {
    //Basic radio button
    cy.visit("https://seleniumbase.io/demo_page"); // visiting the website page
    cy.get("#mySelect")
      .select("Set to 100%", { force: true })
      .should("have.value", "100%");
  });
  it("Handling dynamic dropdown", function () {
    //Basic radio button
    cy.visit(
      "https://demos.telerik.com/aspnet-ajax/dropdownlist/examples/overview/defaultcs.aspx"
    ); // visiting the website page
    cy.get("#ctl00_ContentPlaceholder1_ctl00").click({ force: true });
    cy.get(".rddlItem").contains("Ikura").click({ force: true });
  });
  it("Handling Multiple dropdown", function () {
    //Basic radio button
    cy.visit("https://demo.mobiscroll.com/jquery/select/multiple-select"); // visiting the website page
    cy.get("#multiple-select-input").click({ force: true });
    cy.get(
      'div[class="mbsc-scroller-wheel-item mbsc-ios mbsc-ltr mbsc-wheel-item-checkmark mbsc-wheel-item-multi"]'
    )
      .contains("Books")
      .click({ force: true });
    cy.get(
      'div[class="mbsc-scroller-wheel-item mbsc-ios mbsc-ltr mbsc-wheel-item-checkmark mbsc-wheel-item-multi"]'
    )
      .contains("Movies, Music & Games")
      .click({ force: true });
  });
});
