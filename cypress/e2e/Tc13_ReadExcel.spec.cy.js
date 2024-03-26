describe("Excel test", () => {
  var data;
  beforeEach(() => {
    data = cy
      .task("readXlsx", {
        file: "cypress/fixtures/ConduitExcelData.xlsx",
        sheet: "Sheet1",
      })
      .then((rows) => {
        data = rows;
      });
  });
  it("Condouit - Valid Credentials", function () {
    cy.visit("https://react-redux.realworld.io/"); // visiting the website
    cy.get('a[href="#login"').click(); // clicking on login button from
    cy.get('input[placeholder="Email"]').type(data[0].username); // typing email in input field
    cy.get('input[placeholder="Password"]').type(data[0].password); // typing password in password field
    cy.get('button[type="submit"]').click(); // submitting the form by clicking on submit button
    cy.get('a[href="#settings"]').click(); // going to settings page by clicking on setting link
    cy.get(".btn.btn-outline-danger").click(); // logging out by clicking logout button
  });

  it("Condouit - Invalid Credentials", function () {
    cy.visit("https://react-redux.realworld.io/"); // visiting the website
    cy.get('a[href="#login"').click(); // clicking on login button from
    cy.get('input[placeholder="Email"]').type(data[1].username); // typing email in input field
    cy.get('input[placeholder="Password"]').type(data[1].password); // typing password in password field
    cy.get('button[type="submit"]').click(); // submitting the form by clicking on submit button
    cy.get(".error-messages").should("contain", "email or password is invalid");
  });
});
