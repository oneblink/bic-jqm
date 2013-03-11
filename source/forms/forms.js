define(
  ['data/data', 'BlinkForms', 'underscore'],
  function (Backbone, BlinkForms, _) {
    "use strict";
    var Forms = Backbone.Model.extend({
      initialize: function () {
        var Sample1 = {
          default: {
            name: 'form1',
            label: 'Form 1',
            _elements: [
              {
                default: {
                  name: 'id',
                  type: 'hidden'
                }
              },
              {
                default: {
                  name: 'date',
                  label: 'Date',
                  type: 'date'
                }
              },
              {
                default: {
                  name: 'time',
                  label: 'Time',
                  type: 'time'
                }
              },
              {
                default: {
                  name: 'datetime',
                  label: 'Date + Time',
                  type: 'datetime'
                }
              },
              {
                default: {
                  name: 'file',
                  label: 'File',
                  type: 'file'
                }
              },
              {
                default: {
                  name: 'image',
                  label: 'Image',
                  type: 'image'
                }
              },
              {
                default: {
                  name: 'selectc',
                  label: 'Select C',
                  type: 'select',
                  mode: 'collapsed',
                  options: {
                    a: 'alpha',
                    b: 'beta',
                    g: 'gamma'
                  }
                }
              },
              {
                default: {
                  name: 'selecte',
                  label: 'Select E',
                  type: 'select',
                  mode: 'expanded',
                  layout: 'horizontal',
                  options: {
                    a: 'alpha',
                    b: 'beta',
                    g: 'gamma'
                  }
                }
              },
              {
                default: {
                  name: 'multic',
                  label: 'Multi C',
                  type: 'multi',
                  mode: 'collapsed',
                  options: {
                    a: 'alpha',
                    b: 'beta',
                    g: 'gamma'
                  }
                }
              },
              {
                default: {
                  name: 'multie',
                  label: 'Multi E',
                  type: 'multi',
                  mode: 'expanded',
                  options: {
                    a: 'alpha',
                    b: 'beta',
                    g: 'gamma'
                  }
                }
              },
              {
                default: {
                  name: 'boolean',
                  label: 'Boolean',
                  type: 'boolean',
                  options: {
                    0: 'false',
                    1: 'true'
                  }
                }
              },
              {
                default: {
                  name: 'question',
                  label: 'Question',
                  type: 'boolean',
                  options: {
                    n: 'no',
                    y: 'yes'
                  }
                }
              }
            ]
          }
        };

        BlinkForms.getDefinition = function (name, action) {
          var collapseAction = function (d) {
            var attrs = d.default || {};
            if (action && d[action]) {
              _.extend(attrs, d[action]);
            }
            return attrs;
          },
            definition = {
              default: {
                name: name
              }
            };

          definition.default._elements = _.map(Sample1.default._elements, collapseAction);
          return definition.default;
        };
      },

      getForm: function (name, action) {
        BlinkForms.initialize(BlinkForms.getDefinition(name, action));
        return BlinkForms.currentFormObject;
      }
    }),
      forms;

    forms = new Forms();

    return forms;
  }
);
