# Changelog


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
