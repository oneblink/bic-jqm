/*global chai:true, describe:true, it:true, before: true, beforeEach:true, after:true, afterEach:true, expect:true, should:true, sinon:true */
define('model-datasuitcase-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Model.extend();
});

define('model-form-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Model.extend();
});

define('collection-datasuitcases-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Collection.extend();
});

define('collection-forms-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Collection.extend();
});

define('collection-interactions-mobile', ['backbone'], function (Backbone) {
  "use strict";
  return Backbone.Collection.extend();
});

define(['../../scripts/model-application-mobile.js', 'backbone'],
  function (Model, Backbone) {
    "use strict";
    describe('Model - Application', function () {
      it("should exist", function () {
        should.exist(Model);
      });

      it("should be an instance of backbone model", function () {
        Model.should.be.an.instanceOf(Backbone.Model);
      });
    });
  });
