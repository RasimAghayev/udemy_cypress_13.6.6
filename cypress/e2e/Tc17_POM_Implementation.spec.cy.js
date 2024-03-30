import LandingPage from "./pages/landingPage";
import LoginPage from "./pages/loginPage";
import HomePage from "./pages/homePage";
import SettingsPage from "./pages/SettingsPage";

describe("Page Object Model test", () => {
  const landingPage = new LandingPage();
  const loginPage = new LoginPage();
  const homePage = new HomePage();
  const settingsPage = new SettingsPage();

  beforeEach(() => {
    cy.fixture("conduitLoginData").as("data");
  });
  it("Condouit - Valid Credentials", function () {
    cy.visit("https://react-redux.realworld.io/"); // visiting the website
    landingPage.clickSignInButton();
    loginPage.enterEmail(this.data.valid.email);
    loginPage.enterPassword(this.data.valid.password);
    loginPage.clickSignInButton();
    homePage.checkYourFeedIsVisible();
    homePage.clickSettingsButton();
    settingsPage.clickLogoutButton();
  });
});
