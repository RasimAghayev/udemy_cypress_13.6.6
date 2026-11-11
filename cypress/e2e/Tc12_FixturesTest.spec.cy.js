describe("Fixtures test", () => {
  beforeEach(() => {
    cy.fixture("conduitLoginData").as("data");
  });
  it("Condouit - Valid Credentials", function () {
    cy.visit("https://react-redux.realworld.io/"); // visiting the website
    cy.get('a[href="#login"').click(); // clicking on login button from
    cy.get('input[placeholder="Email"]').type(this.data.valid.email); // typing email in input field
    cy.get('input[placeholder="Password"]').type(this.data.valid.password); // typing password in password field
    cy.get('button[type="submit"]').click(); // submitting the form by clicking on submit button
    cy.get('a[href="#settings"]').click(); // going to settings page by clicking on setting link
    cy.get(".btn.btn-outline-danger").click(); // logging out by clicking logout button
  });

  it("Condouit - Invalid Credentials", function () {
    cy.visit("https://react-redux.realworld.io/"); // visiting the website
    cy.get('a[href="#login"').click(); // clicking on login button from
    cy.get('input[placeholder="Email"]').type(this.data.invalid.email); // typing email in input field
    cy.get('input[placeholder="Password"]').type(this.data.invalid.password); // typing password in password field
    cy.get('button[type="submit"]').click(); // submitting the form by clicking on submit button
    cy.get(".error-messages").should("contain", "email or password is invalid");
  });
});
