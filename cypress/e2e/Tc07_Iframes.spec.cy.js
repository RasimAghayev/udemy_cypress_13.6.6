describe("Advanced UI Elements", () => {
  it("Web Iframe", () => {
    cy.visit("https://the-internet.herokuapp.com/iframe");
    // 1. Basically
    cy.get("#mce_0_ifr").type("Hello TextBox");

    // 2. Iframe content:
    cy.get("#mce_0_ifr").within(($iframe) => {
      const element = $iframe.contents().find("#tinymce");
      cy.wrap(element).clear().type("Hello textbox 2");
    });
  });
});
