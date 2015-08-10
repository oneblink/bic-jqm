# BlinkMobile Intelligent Client

execute a platform-agnostic definition, becoming a ready-to-use app

[![Build Status](https://travis-ci.org/blinkmobile/bic-jqm.png)](https://travis-ci.org/blinkmobile/bic-jqm)


## Core Technologies

* jQuery Mobile
* Backbone
* RequireJS


## Semantic Versioning

This project follows [Semantic Versioning](http://semver.org/) principles.


## Project Setup

1. Check out the source
2. Switch to develop branch
3. Set up git-flow
4. npm install


## Developing

1. `grunt develop` for continuously running tests
2. open browser
3. go to http://localhost:9876/integration

By default, tests are executed in PhantomJS. If you want to execute tests in all
locally available browsers, use `grunt karma:auto`.

## General Notes on BIC structure

The entry point for the application is src/main.js

Main bootstraps the application and requires the router (src/router.js), which co-ordinates the rest of the application initialisation.


## Contribution

Pull requests are welcome. But first, familiarise yourself with our guidelines (they are short):

- https://github.com/blinkmobile/docs/wiki/Process:-Git-Flow

- https://github.com/blinkmobile/docs/wiki/Code-Style:-JavaScript
