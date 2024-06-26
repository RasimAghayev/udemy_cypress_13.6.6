const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "sjer8k",
  screenshotsFolder: "cypress\reportsmochareportsassets",
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
  screenshotOnRunFailure: false,
  video: false,
  e2e: {
    baseUrl: "https://react-redux.realworld.io/",
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
  },
});
