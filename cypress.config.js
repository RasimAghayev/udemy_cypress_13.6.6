const { defineConfig } = require("cypress");
const cucumber=require('cypress-cucumber-preprocessor').default


module.exports = defineConfig({
  projectId: "sjer8k",
  screenshotsFolder: "cypress/reports/mochareports/assets",
  reporter: "cypress-multi-reporters",
  reporterOptions: {
    reporterEnabled: "mochawesome",
    mochawesomeReporterOptions: {
      reportDir: "cypress/reports/mocha",
      quiet: true,
      overwrite: false,
      html: false,
      json: true,
    },
  },
  screenshotOnRunFailure: true,
  video: false,
  e2e: {
    baseUrl: "https://react-redux.realworld.io/",
    setupNodeEvents(on, config) {
      on('file:prepprocessor',cucumber())
      return require("./cypress/plugins/index.js")(on, config);
    },
    specPattern:"cypress/e2e/cucumber/feature/*.feature"
  },
});
