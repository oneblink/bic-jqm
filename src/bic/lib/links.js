/* @flow */

/* :: declare function define(require: Function): void */

define(function (require) {
  'use strict';

  function destinationFromElement (
    $element /* : any */,
    app /* : any */
  ) /* : ?String */ {
    if ($element.attr('keyword')) {
      return $element.attr('keyword');
    }
    if ($element.attr('interaction')) {
      return $element.attr('interaction');
    }
    if ($element.attr('category')) {
      return $element.attr('category');
    }
    if ($element.attr('masterCategory')) {
      return $element.attr('masterCategory');
    }
    if ($element.attr('home') !== undefined) {
      return app.get('siteName');
    }
    if ($element.attr('login') !== undefined) {
      if (
        app.has('loginAccess') &&
        app.has('loginUseInteractions') &&
        app.has('loginPromptInteraction')
      ) {
        return app.get('loginPromptInteraction');
      }
      return app.get('siteName');
    }

    return null;
  }

  return {
    destinationFromElement: destinationFromElement
  };
});
