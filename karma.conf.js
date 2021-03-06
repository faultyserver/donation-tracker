const webpackConfig = require('./webpack.config.js');
process.env.CHROME_BIN = require('puppeteer').executablePath();
module.exports = function(config) {
  config.set({
    autoWatch: true,
    browsers: ['ChromeHeadless_without_sandbox'],
    frameworks: ['jasmine'],
    customLaunchers: {
      ChromeHeadless_without_sandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
    },
    files: [
      'bundles/init/index.js',
      'bundles/**/*_spec.js',
      'bundles/**/*Spec.js',
      'bundles/**/*Spec.tsx',
      './spec/Suite.tsx',
    ],
    preprocessors: {
      'bundles/init/*.js': ['webpack'],
      'bundles/**/*_spec.js': ['webpack'],
      'bundles/**/*Spec.js': ['webpack'],
      'bundles/**/*Spec.tsx': ['webpack'],
      './spec/Suite.tsx': ['webpack'],
    },
    webpack: {
      ...webpackConfig,
      mode: 'development',
    },
    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      noInfo: true,
      poll: 1000,
    },
    plugins: ['karma-*'],
  });
};
