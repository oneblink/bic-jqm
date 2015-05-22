BIC
=====

The new and revolutionary BIC client, designed to be a dashing as a handlebar mustache and as fast as a ocelot on speed.

[![Join the chat at https://gitter.im/blinkmobile/bic-v3](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/blinkmobile/bic-v3?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/blinkmobile/bic-v3.png)](https://travis-ci.org/blinkmobile/bic-v3)

Core Technologies
-----------------
* jQuery Mobile
* Backbone
* RequireJS

## Version Numbers

This project is NOT versioned according to Semantic Versioning. Rather, it is versioned according to our [Shifted Semantic Versioning](https://github.com/blinkmobile/docs/wiki/Process:-Semantic-Versioning#shifted-semantic-versioning).

Project Setup
---------------
1. Check out the source
2. Switch to develop branch
3. Set up git-flow
4. npm install

Developing
----------------
1. `grunt develop` for continuously running tests
2. open browser
3. go to http://localhost:9876/integration

Release Process
---------------
1. `cd {{BIC}}`
2. Run `grunt`, if no errors GOTO 3, otherwise fix the errors.
3. Do a git flow release
4. Edit the version.json file to specify the current version number
5. `grunt build`
6. The built artifacts can be found in the versions folder
8. Commit changes
9. Finish git flow release
10. Push changes to GitHub
11. Open https://github.com/blinkmobile/bic-v3/releases
12. Click draft a new release
13. Select the tag from the git flow release
14. Add change notes
15. Release

General Notes on BIC structure
---------------
The entry point for the application is src/main.js

Main bootstraps the application and requires the router (src/router.js), which co-ordinates the rest of the application initialisation.

## Contribution

Pull requests are welcome. But first, familiarise yourself with our guidelines (they are short):

- https://github.com/blinkmobile/docs/wiki/Process:-Git-Flow

- https://github.com/blinkmobile/docs/wiki/Code-Style:-JavaScript
