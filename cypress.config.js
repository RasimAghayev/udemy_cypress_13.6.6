const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: 'sjer8k',
  screenshotOnRunFailure: false,
  video: false,
  e2e: {
    baseUrl: "https://react-redux.realworld.io/",
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
  },
});
