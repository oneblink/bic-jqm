/*eslint-env node*/
/*eslint-disable no-process-env*/
'use strict';

// exports

module.exports = {
  urls: [
    'http://localhost:9998/tests/index.html'
  ],
  tunnelTimeout: 5,
  build: process.env.TRAVIS_BUILD_NUMBER,
  concurrency: 3,
  browsers: [
    {
      browserName: "internet explorer",
      version: "11"
    },
    {
      browserName: "firefox",
      version: "37"
    },
    {
      browserName: "googlechrome",
      version: "41"
    },
    {
      browserName: "android",
      version: "4.3",
      "device-orientation": "portrait"
    },
    {
      browserName: "iphone",
      version: "8.2",
      "device-orientation": "portrait"
    },
    {
      browserName: "safari",
      version: "7"
    }
  ],
  testname: 'bic-v3',
  tags: [
    process.env.TRAVIS_BRANCH
  ]
};
