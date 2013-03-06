define(
  ['backbone', 'api/API'],
  function (Backbone, API) {
    "use strict";
    var data = {
      readModel: function (model, options) {
        // Logic to eventually re-introduce:
        // 1. Check if an item already exists in offline store
        // 2. If it does, then check to see if it is too old
        // 3. If not, return it
        // 4. If too old, but device is offline, return it anyway
        // 5. Also check if $args are present and need to be accounted for
        // 6. Otherwise fetch the object
        // 7. Append a timestamp & store in offline store
        // 8. Return to user
        var done, fail;

        done = function (data, status, xhr) {
          options.success(model, data, options);
        };
        fail = function (xhr, status, error) {
          options.error(model, xhr, options);
        };

        switch (model.get("type")) {
        case "interaction":
          API.getInteraction(model.get('siteName'), model.get('name'), model.get('args')).done(done).fail(fail);
          break;
        case "answerSpace":
          API.getAnswerSpace(model.get('siteName')).done(done).fail(fail);
          break;
        case "DataSuitcase":
          API.getDataSuitcase(model.get('siteName'), model.get("name")).done(done).fail(fail);
          break;
        default:
          options.error(model, null, options);
          break;
        }
      }
    };

    Backbone.sync = function (method, model, options) {
      data.readModel(model, options);
    };
    return Backbone;
  }
);
