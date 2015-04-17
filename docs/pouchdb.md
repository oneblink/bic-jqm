# BIC and PouchDB

If you want to access PouchDB directly, you may do so via Require.JS:

```javascript
require(['pouchdb'], function (PouchDB) {
  var db;
  console.log(PouchDB.version); // e.g. outputs "3.2.1" as the library version
  db = new PouchDB('dbname');
  // do things with `db` as per PouchDB API: http://pouchdb.com/api.html
});
```

We plan to follow new versions of PouchDB as they are available, and we will
note in our changelog when we update it.


## PouchDB vs IndexedDB vs WebSQL

We configure PouchDB to use IndexedDB (a Web Platform feature) if both available
and functional.

Otherwise, if we are operating with our native app shell, then we attempt to
fall back to WebSQL (an older Web Platform feature).

If neither of these is true, then we avoid PouchDB entirely and store data in
memory, without any persistance.

When using PouchDB directly, write your code such that it works in these three
scenarios.


## BIC DB names

We use the following DB names, where "answerspace" is the lower-case name of the
current answerSpace:

- answerspace-DataSuitcase
- answerspace-Form: i.e. Forms definitions
- answerspace-FormRecord
- answerspace-Interaction
- answerspace-Pending
- answerspace-Star

IndexedDB and WebSQL both store data on per-origin basis, so prepending the
answerSpace name allows us to use more than one answerSpace on the same domain,
without mixing or corrupting data.
