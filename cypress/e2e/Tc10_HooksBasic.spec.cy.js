describe("Hooks basics", () => {
  before(() => {
    cy.log("Before block");
  });

  beforeEach(() => {
    cy.log("Before Each block");
  });

  it("Search item", () => {
    cy.log("This is Search item block");
  });

  it("Order item", () => {
    cy.log("This is order item block");
  });

  it("Check out item", () => {
    cy.log("This is check out item block");
  });

  afterEach(() => {
    cy.log("After Each block");
  });

  after(() => {
    cy.log("Afet block");
  });
});
