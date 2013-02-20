requirejs.config({
    baseUrl: '/_BICv3_/source',
    paths:{
        text: ['https://d1c6dfkb81l78v.cloudfront.net/requirejs/2.1.2/text'],
        jquery: ['https://d1c6dfkb81l78v.cloudfront.net/jquery/1.8.3/jq.min'],
        jquerymobile: ['https://d1c6dfkb81l78v.cloudfront.net/jquery.mobile/1.2.0/jqm.min'],
        underscore: ['https://d1c6dfkb81l78v.cloudfront.net/underscorejs/1.4.3/u.min'],
        backbone: ['https://d1c6dfkb81l78v.cloudfront.net/backbonejs/0.9.10/backbone.min'],
        mustache: ['https://d1c6dfkb81l78v.cloudfront.net/mustache/0.7.2/mustache.min'],
        lawnchair: ['/_BICv3_/assets/js/lawnchair'],
        'lawnchair-indexed-db': ['/_BICv3_/assets/js/lawnchair-indexed-db'],
        'lawnchair-webkit-sqlite': ['/_BICv3_/assets/js/lawnchair-webkit-sqlite']
    },
    shim: {
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'lawnchair': {
            deps: [],
            exports: 'Lawnchair'
        },
        'lawnchair-indexed-db': {
            deps: ['lawnchair'],
            exports: 'Lawnchair'
        },
        'lawnchair-webkit-sqlite': {
            deps: ['lawnchair'],
            exports: 'Lawnchair'
        }
    }
});

define(
    ['backbone', 'routers/v3/router', 'models/v3/interaction', 'views/v3/interaction', 'models/v3/application', 'jquery', 'jquerymobile'],
    function (Backbone, router, InteractionModel, InteractionView, app, $) {

        var location = $.mobile.path.parseLocation();

        app.set({
            "siteName": location.pathname.substr(1).split('/')[0],
            "type": "answerSpace"
        }).fetch({success: function(model, response, options){
            $.mobile.defaultPageTransition = model.get("defaultTransition");
        }});
            
        var bootstrap = JSON.parse($('#bootstrap').first().html());
        var tempmodel = new InteractionModel(bootstrap);
        $('#bootstrap').remove();
        var tempview = new InteractionView({
            model: tempmodel,
            el: '[data-url="' + location.pathname + '"]'
        }).render();
        tempview.$el.attr("data-external-page", true);
        tempview.$el.one('pagecreate', $.mobile._bindPageRemove);
        tempview.$el.page().trigger('pagecreate');
});
