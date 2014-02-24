      pendingQueue: function () {
        //var el = $('#pendingContent');
        var pendingExtractor = function (status) {
          return _.map(app.pending.where({status: status}), function (pendingItem) {
            var pendingAttrs = _.clone(pendingItem.attributes);
            pendingAttrs.editInteraction = app.interactions.where({
              blinkFormObjectName: pendingItem.get("name"),
              blinkFormAction: 'edit'
            })[0].id;
            return pendingAttrs;
          });
        };

        this.$el.append(Mustache.render(pendingTemplate, {
          pending: pendingExtractor("Pending"),
          draft: pendingExtractor("Draft")
        }));
        this.$el.trigger('pagecreate');
        $('#pendingPopup').popup('open');
      },







      addToQueue: function (status) {
        var view = this;
        BlinkForms.current.data().then(function (data) {
          data._action = view.model.get("blinkFormAction");
          var modelAttrs = {
            type: "Form",
            status: status,
            name: view.model.get("blinkFormObjectName"),
            action: view.model.get("blinkFormAction"),
            answerspaceid: app.get("dbid"),
            data: data
          };
          if (view.model.get("blinkFormAction") === "edit") {
            app.pending.get(view.model.get("args")['args[id]']).set(modelAttrs);
          } else {
            app.pending.create(modelAttrs);
          }
          app.pending.processQueue();
          view.home();
        });
      },
