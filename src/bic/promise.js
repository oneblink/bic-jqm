define(['feature!promises'], function (Promise) {
  // poly-fill Promise if missing (needed for Forms, etc)
  window.Promise = window.Promise || Promise;

  return Promise;
});
