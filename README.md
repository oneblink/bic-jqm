BICv3
=====
The new and revolutionary BIC client, designed to be a dashing as a handlebar mustache and as fast as a ocelot on speed.

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
The project should run fine as is, though you may wish to improve, optimize, test and otherwise work on this.

In that case, you should:

1. Check out the source
2. Switch to develop branch
3. Set up git-flow
4. NPM install

Developing
----------------
1. `grunt develop`
2. Modify source files
3. Perform releases, as neccasary


Release Process
---------------

1. `cd {{BIC}}`
2. Run `grunt`, if no errors GOTO 3, otherwise fix the errors.
3. Do a git flow release
3. `node -p -e "Date.now()"` - this is your build timestamp
4. `mv js {{timestamp}}`
5. Checkout 'cdn-platform-assets'
6. `cp {{timestamp}} {{CDN}}/blink/bic/3/{{timestamp}}`
7. `vim {{CDN}}/blink/bic/versions.json` - append build details, following previous examples
8. Commit changes and push
9. `cd {{timestamp}}` (Inside the BIC version)
10. `gzip -k bic.js`
11. Open CyberDuck
12. Connect to S3 CDN bucket
13. Upload {{timestamp}} to /blink/bic/3/{{timestamp}}
14. Right click /blink/bic/3/{{timestamp}}/bic.js.gz
15. Click info
16. Switch to Metadata tab
17. Set 'Content-Encoding' to 'gzip'
18. Set 'Content-Type' to 'application/javascript'
19. Try out the new BIC version in an answerSpace
20. Open https://github.com/blinkmobile/bic-v3/releases
21. Click draft a new release
22. Select the tag from the git flow release
23. Add change notes
24. Release

Rollback
---------------
1. Delete the files from the S3 bucket
3. Modify the entry for the build in the version.json file to mark as deprecated
4. Commit the changes to the CDN repo

General Notes on BIC structure
---------------
The entry point for the application is scripts/main.js

Main bootstraps the application and sets up the application model (scripts/model-application.js).

The application model then takes over and co-ordinates the rest of the application lifecycle. If you need to work out what is happening somewhere in the application, you can generally follow the flow of logic from the application model outwards.

## Contribution

Pull requests are welcome. But first, familiarise yourself with our guidelines (they are short):

- https://github.com/blinkmobile/docs/wiki/Process:-Git-Flow

- https://github.com/blinkmobile/docs/wiki/Code-Style:-JavaScript
