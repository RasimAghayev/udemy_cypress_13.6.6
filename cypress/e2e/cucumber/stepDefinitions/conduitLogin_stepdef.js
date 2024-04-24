import {Given, When, Then } from 'cypress-cucumber-preprocessor/steps'
 
// beforeEach(function(){
//     cy.fixture('ConduitData').as('data')
// })
 
Given('User is on the login page',()=>{
    cy.visit("https://react-redux.realworld.io/"); // visiting the website
    cy.get('a[href="#login"').click(); // clicking on login button from
})
When(' User login with valid credentials',(dataTable)=>{
    // cy.get('input[placeholder="Email"]').type(this.data.email); // typing email in input field
    // cy.get('input[placeholder="Password"]').type(this.data.password); // typing password in password field
    cy.get('input[placeholder="Email"]').type(dataTable.rawTable[1][0]); // typing email in input field
    cy.get('input[placeholder="Password"]').type(dataTable.rawTable[1][1]); // typing password in password field
    cy.get('button[type="submit"]').click(); // submitting the form by clicking on submit button
})
When(' User click on the settings button',()=>{
    cy.get('a[href="#settings"]').click(); // going to settings page by clicking on setting link

})
When('User click on the logout button',()=>{
    cy.get(".btn.btn-outline-danger").click(); // logging out by clicking logout button

})
Then('User should be routed back to login page',()=>{
    cy.title().should('eq','Conduit')
})