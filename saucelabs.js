/*jslint indent:2, maxlen:80, node:true*/
'use strict';

// exports

module.exports = {
  urls: [
    'http://localhost:9999/tests/index.html'
  ],
  tunnelTimeout: 5,
  build: process.env.TRAVIS_JOB_ID,
  concurrency: 3,
  browsers: [
    {
      browserName: "internet explorer",
      version: "11",
      platform: "Windows 8.1"
    },
    {
      browserName: "internet explorer",
      version: "10",
      platform: "Windows 8"
    },
    {
      browserName: "firefox",
      version: "28",
      platform: "Windows 7"
    },
    {
      browserName: "googlechrome",
      version: "33",
      platform: "OS X 10.9"
    },
    {
      browserName: "android",
      version: "4.1",
      platform: "Linux",
      "device-orientation": "portrait"
    },
    {
      browserName: "iphone",
      version: "7.1",
      platform: "OS X 10.9",
      "device-orientation": "portrait"
    },
    {
      browserName: "safari",
      version: "6",
      platform: "OS X 10.8"
    }
  ],
  testname: 'bic-v3',
  tags: ['master']
};
