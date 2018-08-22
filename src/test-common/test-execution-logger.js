/**
 * Small reporter to log next test to be executed
 * This is very useful for analysing issues reported by the CI, where the test execution crashes
 * and does not report during which test the error happened.
 */
jasmine.getEnv().addReporter({
  specStarted: function(result) {
    console.log('executing:', result.fullName);
  }
});
