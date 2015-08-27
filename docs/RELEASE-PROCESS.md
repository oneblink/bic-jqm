# BIC: Release Process

## BIC Project

Follow directions from here:
https://github.com/blinkmobile/docs/wiki/Process:-JIRA-Versions-Releases

Update your local working copy when directed:

1. `git checkout develop && git pull`


Now we do our Git Flow process and our testing:

1. `git flow release start vx.x.x`

2. `npm install; npm update`

3. `npm test`, confirm everything passes

4. `npm outdated`, keep devDependencies up to date in package.json

5. `npm install; npm update` (if you changed package.json)

6. `grunt build; npm test`, confirm everything passes (if you changed package.json)

7. execute [MANUAL-TESTS.md](MANUAL-TESTS.md), fix issues until everything PASSes

8. (from above JIRA guide) update CHANGELOG.md based on Issues Done (and commit)

9. bump version in package.json AND main.js (and commit)

10. `git flow release finish vx.x.x`, using "vx.x.x" as the tag's message

- resolve any merge issues

Perform the remote-repository steps below if this is the last release today.
Otherwise, if we are doing a BIC release that targets a new Forms version, then
just stop here.

To point BIC at a new Forms version, change the `formsversion` property in
package.json.

11. `git checkout develop && git pull && git push`

12. `git checkout master && git pull && git push && git push --tags`

13. `grunt build; npm test`, just to trigger a fresh build

Now the Git project is up to date and everything.


## CDN-Platform-Assets Project

1. `git checkout master`

2. `grunt build; npm test`

Follow directions from here:
https://github.com/blinkmobile/docs/wiki/Process:-Updating-CDN

The "desired additions" are:

3. `cp -av path/to/bic/dist/latest blink/bic/3/`

- double-check that it follows similar patterns to previous releases

4. modify blink/bic/versions.json based on blink/bic/3/latest/versions.json

5. `npm test`

6. add, commit, push, etc

Complete the rest of the process as directed.

Within 15 minutes, the BMP services will have updated their local copies.


## GitHub releases

https://github.com/blinkmobile/bic-jqm/releases

1. Draft New Release

2. edit previous releases to see how we format them

3. copy-paste contents from CHANGELOG.md (including from Forms, if necessary)
