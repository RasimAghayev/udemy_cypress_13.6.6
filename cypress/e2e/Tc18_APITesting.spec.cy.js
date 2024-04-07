describe("API testing", () => {
  const urlBase = "https://reqres.in/api";

  it("GET API Testing", () => {
    cy.request("GET", `${urlBase}/users?page=2`).then((response) => {
      expect(response.status).equal(200);
      expect(response.body.data[1].first_name).equal("Lindsay");
    });
  });
  it("POST API Testing", () => {
    const user = {
      name: "morpheus",
      job: "leader",
    };
    cy.request("POST", `${urlBase}/users`, user).then((response) => {
      expect(response.status).equal(201);
      expect(response.body.name).equal(user.name);
      expect(response.body.job).equal(user.job);
    });
  });
});
