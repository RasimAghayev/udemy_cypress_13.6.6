describe("Xpath functionality", () => {
  it("Login test using Conduit by xpath locatorss", () => {
    cy.visit("https://react-redux.realworld.io/"); // visiting the website
    cy.xpath("//a[normalize-space()='Sign in']").click(); // clicking on login button from
    cy.xpath("//input[@placeholder='Email']").type("cypressdemo@gmail.com"); // typing email in input field
    cy.xpath("//input[@placeholder='Password']").type("cypressdemo"); // typing password in password field
    cy.xpath("//button[@type='submit']").click(); // submitting the form by clicking on submit button
  });
});
