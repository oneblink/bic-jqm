/* @flow */

/* :: declare function define(require: Function): void */

define(function (require) {
  'use strict';

  function destinationFromElement (
    $element /* : any */,
    app /* : any */
  ) /* : ?string */ {
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

  function nextPagePath (
    current /* : string */,
    destination /* : string */,
    app /* : any */
  ) /* : string */ {
    var pathParts = current.split('/');
    var siteName = app.get('siteName');

    // if path begins with a "/", then there will be an empty string post-split
    // also accounts for file:/// with triple slash, or leading slashes
    pathParts = pathParts.filter(function (p) {
      return p.trim();
    });

    // add new location to end
    pathParts.push(destination);

    // cull duplicates, preferring right-most occurrences
    // e.g. [ 'dog', 'cat', 'dog' ] => [ 'cat', 'dog' ]
    pathParts.reverse();
    pathParts = pathParts
      .map(function (pathPart) { return pathPart.toLowerCase(); })
      .filter(function (pathPart) {
        var model = app.interactions.get(pathPart);
        // segment has valid type
        // segment is not site-root (we prepend it later)
        return model && (model.get('type') || model.id !== siteName);
      })
      .reduce(function (result, pathPart) {
        if (result.indexOf(pathPart) === -1) {
          result.push(pathPart);
        }
        return result;
      }, []);
    pathParts.reverse();

    // account for first-time through hash-based process
    if (pathParts[0] !== siteName) {
      pathParts.unshift(siteName);
    }

    return '/' + pathParts.join('/');
  }

  return {
    destinationFromElement: destinationFromElement,
    nextPagePath: nextPagePath
  };
});
