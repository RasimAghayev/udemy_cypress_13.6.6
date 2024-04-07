describe("API testing", () => {
  const urlBase = "https://reqres.in/api";

  it("GET API Testing", () => {
    cy.request("GET", `${urlBase}/users?page=2`).then((response) => {
      expect(response.status).equal(200);
      expect(response.body.data[1].first_name).equal("Lindsay");
    });
  });
});
