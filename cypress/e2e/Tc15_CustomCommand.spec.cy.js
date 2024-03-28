describe("Custom command test", () => {
  beforeEach(() => {
    cy.fixture("conduitLoginData").as("data");
  });
  it("Condouit - Valid Credentials", function () {
    cy.conduItLogin(this.data.valid.email, this.data.valid.password);
    cy.get('a[href="#settings"]').click(); // going to settings page by clicking on setting link
    cy.get(".btn.btn-outline-danger").click(); // logging out by clicking logout button
  });

  it("Condouit - Invalid Credentials", function () {
    cy.conduItLogin(this.data.invalid.email, this.data.invalid.password);
    cy.get(".error-messages").should("contain", "email or password is invalid");
  });
});
