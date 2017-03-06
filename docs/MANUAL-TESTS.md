# BIC-jQM: Manual Tests


## 1. dependencies should install without errors

`npm install; npm update`


## 2. automated tests should complete without errors

`grunt build; npm test`


## 3. automated tests in all browsers should complete without errors

`grunt karma:auto`

Due to timing and performance differences, you may experience random failures.
If this occurs, manually run the tests in one browser at a time to double-check.


## 4. sample answerSpace should function as expected in browser

- start proxy with `grunt develop`

- navigate to http://localhost:9876/integration

- confirm answerSpace functionality


## 5. sample answerSpace should function as expected in mBaaS app (Android)

- https://play.google.com/store/apps/details?id=au.com.blinkmobile.android.master.pilot

- start proxy with `grunt develop`

- determine your machine's IP address

- navigate mBaaS app to http://<IP>:9876/integration

- confirm answerSpace functionality as for the browser (above)


## 6. sample answerSpace should function as expected in mBaaS app (iOS)

- https://itunes.apple.com/au/app/mbaas-enterprise-pilot/id957258581

- follow same steps as for the mBaaS app for Android (above)


## 7. double-check reported BIC and Forms versions

- double-check [package.json](../package.json) has correct "version" and "formsversion"

- start proxy with `grunt develop`

- navigate to http://localhost:9876/tests

- run `window.BMP.BIC.version` in JavaScript Console and confirm output

- run `window.BMP.Forms.version` in JavaScript Console and confirm output
