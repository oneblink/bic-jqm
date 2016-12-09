# BIC: Support Process for 4.x

Got a new release against the current major version? e.g. 5.x
Got a previous major version that also needs some attention? e.g. 4.x
If you answered "yes" to both, then this guide is for you

Hopefully this will not occur too frequently


## Overview

Be familiar with our [RELEASE_PROCESS.md](./RELEASE_PROCESS.md).
This will be almost the same, but with some important differences.

You will follow the normal procedure (linked above) to produce the latest release for the current major version.

Then you will follow the same process (in spirit) for an older major version,
but DO NOT use any `git flow` commands.
We need to manage the branches and tags explicitly.


## Release Process for Non-Current Major Version

1.  follow the normal procedure for the current major version

2.  checkout the latest tag for the old major version, and make a new "master-X.x" branch if it does not exist (e.g. "master-4.x")

3.  checkout the "master-X.x" branch for the old version

4.  cherry-pick any changes you need in from the current "master" branch

5.  create the usual release / bump commit to add CHANGELOG.md entries and bump the version number in src/bic.js and package.json

6.  tag that commit with the appropriate version number

7.  create a build from that tagged commit

8.  follow the normal process for getting the build files up to the CDN
