const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'sjer8k',
  screenshotsFolder: 'cypress/reports/mochareports/assets',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'mochawesome',
    mochawesomeReporterOptions: {
      reportDir: 'cypress/reports/mocha',
      quiet: true,
      overwrite: false,
      html: false,
      json: true,
      timestamp: 'mmddyyyy_HHMMss',
    },
  },
  screenshotOnRunFailure: true,
  video: false,
  e2e: {
    baseUrl: 'https://react-redux.realworld.io/',
    setupNodeEvents(on, config) {
      // Structured logging for test events
      on('task', {
        log(message) {
          console.log(
            JSON.stringify({ level: 'info', timestamp: new Date().toISOString(), message })
          );
          return null;
        },
        logError(message) {
          console.error(
            JSON.stringify({ level: 'error', timestamp: new Date().toISOString(), message })
          );
          return null;
        },
      });
      return require('./cypress/plugins/index.js')(on, config);
    },
  },
});
