requirejs.config({
    baseUrl: '/_BICv3_/source',
    paths:{
        text: ['/_BICv3_/assets/js/text'],
        jquery: ['/_BICv3_/assets/js/jquery.min'],
        jquerymobile: ['/_BICv3_/assets/js/jquery.mobile.min'],
        underscore: ['/_BICv3_/assets/js/underscore-min'],
        backbone: ['/_BICv3_/assets/js/backbone'],
        mustache: ['/_BICv3_/assets/js/mustache'],
        json2: ['/_BICv3_/assets/js/json2'],
        lawnchair: ['/_BICv3_/assets/js/lawnchair'],
        'lawnchair-indexed-db': ['/_BICv3_/assets/js/lawnchair-indexed-db'],
        'lawnchair-webkit-sqlite': ['/_BICv3_/assets/js/lawnchair-webkit-sqlite'],
        BForms: ['/_BICv3_/assets/js/BlinkForms-jQueryMobile']
    },
    shim: {
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'json2': {
            deps: [],
            exports: 'JSON'
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
    ['backbone', 'routers/v3/router', 'views/v3/interaction', 'models/v3/application', 'jquery', 'BForms'],
    function (Backbone, router, InteractionView, app, $) {

        var location = $.mobile.path.parseLocation();

        app.set({
            "siteName": location.pathname.substr(1).split('/')[0],
            "type": "answerSpace"
        }).fetch() ;

        var tempview = new InteractionView({
            el: '[data-url="' + location.pathname + '"]'
        });
});
