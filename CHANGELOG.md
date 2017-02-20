# Changelog


## Unreleased


### Changed

-   BIC-252: re-arrange BIC navigation attributes code

    -   improved legibility, and testability


### Fixed

-   BIC-252: BIC navigation attributes work in Cordova apps again

    -   fixed regression from 5.0.0

    -   HelpDesk: 8631-QACM-3751


## 5.0.2 - 2017-01-12


### Fixed

-   BIC-251: submit button stops if there are form validation errors


## 5.0.1 - 2016-12-09


### Changed

- update to Forms 3.10.3 for fixes

    - see https://github.com/blinkmobile/forms/releases/tag/v3.10.3


## 5.0.0 - 2016-11-22


### Changed

-   **BREAKING**: drop features related to old `cordova.offline` in favour of using hash-based routing and [ionic-plugin-deploy](https://github.com/driftyco/ionic-plugin-deploy) instead

    -   do NOT upgrade if you still need compatibility with our older offline-first Android hybrid wrapper

-   **BREAKING**: the following are no longer available: `require('bic/api/native')`, `require(['bic/api/native'])`, `window.BMP.BIC.router.isOfflineFirst`, `window.BMP.BIC.router.offlineDirectory`, `window.BMP.BIC.router.getRootRelativePath()`


### Fixed

-   BIC-250: use hash-based routing in "file:///" environments

    -   corrects issues when BIC is running offline within a webview

    -   HelpDesk: 6283-TPZC-9929

-   update to [sjcl 1.0.6](https://github.com/bitwiseshiftleft/sjcl) for fixes


## 4.3.5 - 2016-07-20


### Changed

- update to Forms 3.10.2 for fixes

    - see https://github.com/blinkmobile/forms/releases/tag/v3.10.2


## 4.3.4 - 2016-07-20


### Fixed

- BIC-244: populate "list" Forms even when data has field names that don't match case (#62, @jokeyrhyme)

    - note: an accompanying change to Forms library is needed for "edit" Forms, too

    - HelpDesk: 4002-UDJX-6616


## 4.3.3 - 2016-06-30


### Changed

- update to Forms 3.10.1 for fixes

    - see https://github.com/blinkmobile/forms/releases/tag/v3.10.1


## 4.3.2 - 2016-06-30


### Fixed

- BIC-242: use new GZIP CDN (same as BMP) (#61, @jokeyrhyme)

    - enables this and newer BIC versions on BMP 3.1.0 and newer to be used with the AppCache Fetcher

    - improves resource loading performance for fresh visitors

    - HelpDesk: 6296-QTAZ-4747


## 4.3.1 - 2016-05-27


- BIC-243: validation no longer blocks save draft (#60, @simonmarklar)

    - also ensure that saving over existing draft works as expected


## 4.3.0 - 2016-04-22


### Changed

- update to Forms 3.10.0 for changes

    - see https://github.com/blinkmobile/forms/releases/tag/v3.10.0


## 4.2.11 - 2016-02-11


### Changed

- update to Forms 3.9.4 for fixes

    - see https://github.com/blinkmobile/forms/releases/tag/3.9.4


## 4.2.10 - 2016-02-11


### Fixed

- BIC-211: Forms library loaded such that interaction-populated choice fields work (#57, @GeetaSajwan)

- BIC-238: Moment.js URLs in AppCache manifest are now correct (#59, @jokeyrhyme)

    - HelpDesk: 5592-WEGJ-0376

- BIC-239: detect `ms-appx-web:` as an offline protocol (#58, @simonmarklar)


## v4.2.9 - 2016-01-15


### Changed

- BIC-233: register Moment.js with Require.js (#56, @simonmarklar)

    - allows custom code to `require(['moment'], /* ... */)`

    - HelpDesk: 3214-YIHX-8393

- update to Forms v3.9.3 for fixes

    - see https://github.com/blinkmobile/forms/releases/tag/v3.9.3


## v4.2.8 - 2015-11-12


### Changed

- update to Forms v3.9.2 for fixes

    - see https://github.com/blinkmobile/forms/releases/tag/v3.9.2


## v4.2.7 - 2015-12-03


### Fixed

- BIC-217: refresh configuration after login / logout (#55, @GeetaSajwan)


## v4.2.6 - 2015-11-12


### Changed

- update to Forms v3.9.1 for fixes

    - see https://github.com/blinkmobile/forms/releases/tag/v3.9.1


## v4.2.5 - 2015-11-12


### Fixed

- BIC-200: for protected answerSpaces, no longer briefly display a different interaction first before redirecting to login

- BIC-232: loading a form from the pending queue whilst another form is active no longer triggers a console error


## v4.2.4 - 2015-10-27


### Changed

- update to Forms v3.9.0 for changes and fixes

    - see https://github.com/blinkmobile/forms/releases/tag/v3.9.0


## v4.2.3 - 2015-10-27


### Fixed

- BIC-225: explicitly dismiss native splash screen _after_ "loading..."

    - requires upcoming iOS and Android app shell releases

    - HelpDesk: 4236-WYDZ-2353

- BIC-231: fix homeInteraction setting after regression in BIC-218


## v4.2.2 - 2015-10-16


### Changed

- update to Forms v3.8.1 for changes and fixes

    - see https://github.com/blinkmobile/forms/releases/tag/v3.8.1


## v4.2.1 - 2015-10-16


### Fixed

- BIC-218: refactored navigation routing to allow future extensibility,
  and improved maintainability

- BIC-228: fixed a case where form validation error summaries would not display,
  and would block further submission attempts

    - HelpDesk: 1652-ODLM-4900, 6953-ERSG-1898

- BIC-229: list view now supports forms that are missing certain actions (e.g. "delete", "edit", etc)


## v4.2.0 - 2015-09-25


### Changed

- update to Forms v3.8.0 for changes and fixes

    - see https://github.com/blinkmobile/forms/releases/tag/v3.8.0


## v4.1.5 - 2015-09-25


### Fixed

- BIC-212: normal scrolling is no longer randomly turned off

- BIC-216: clicking in the forms error summary no longer throws an exception


## v4.1.4 - 2015-09-11


### Changed

- update to Forms v3.7.2 for fixes

    - see https://github.com/blinkmobile/forms/releases/tag/v3.7.2


## v4.1.3 - 2015-09-11


### Fixed

- BIC-197: lists of completed form records in Firefox, Safari and IE

    - was already working in Chrome

    - HelpDesk: 8822-YPJZ-6091

- BIC-208: router navigation better accounts for Cordova paths

    - addresses issues with login interactions


## v4.1.2 - 2015-09-01


### Changed

- update to Forms v3.7.1 for fixes

    - see https://github.com/blinkmobile/forms/releases/tag/v3.7.1


## v4.1.1 - 2015-09-01


### Fixed

- BIC-202: guard against submitting data that may result in unsafe SQL DELETEs

    - HelpDesk: 1593-QEIK-1411

- BIC-205: pre-existing sub-record data now loads as expected

- BIC-206: form submission with a validation error on a different page will no longer throw a `TypeError`


## v4.1.0 - 2015-08-27


### Changed

- update to Forms v3.7.0 for additions and fixes

    - see https://github.com/blinkmobile/forms/releases/tag/v3.7.0


## v4.0.0 - 2015-08-27


### Changed

- BREAKING CHANGE: due to BIC-192, access to the Forms APIs needs to change

    - Forms APIs themselves do not change, just the process of accessing them

    - see [docs/forms-library.md](docs/forms-library.md) for details


### Fixed

- BIC-192: failure to load the Forms library no longer break BIC boot process

    - BIC no longer depends on Forms to boot properly

    - BIC starts loading Forms library (in the background) after BIC initialisation

- BIC-195: homeInteraction setting honoured as expected
