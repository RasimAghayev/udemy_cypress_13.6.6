describe("Hooks Implementation", () => {
    beforeEach(() => {
        cy.visit("https://react-redux.realworld.io/"); // visiting the website
        cy.get('a[href="#login"').click(); // clicking on login button from
        cy.get('input[placeholder="Email"]').type("cypressdemo@gmail.com"); // typing email in input field
        cy.get('input[placeholder="Password"]').type("cypressdemo"); // typing password in password field
        cy.get('button[type="submit"]').click(); // submitting the form by clicking on submit button
    });
  
    it("Tag Mock", () => {
        cy.intercept('GET','/api/tags',{fixture: 'Tags.json'})
        cy.contains('Your Feed').should('be.visible')
        cy.get(".tag-list").should('contain','cypress')
                                .and('contain','udemy')
                                .and('contain','course')
    });
  
    it("Article Mock", () => {
        cy.intercept('GET','/api/articles/*',{fixture: 'Article.json'})
        cy.contains('Your Feed').should('be.visible')
        cy.contains('Global Feed').should('be.visible')
        cy.get(".col-md-9").should('contain','Demo Mock Cypress')
    });
  
    it("Login User Mock", () => {
        cy.intercept('POST','/api/users/login',{fixture: 'Login.json'})
        cy.get('a[href^=#@"]').should('contain','Rasim-Aghayev-Udemy')
    });
  
  });
  