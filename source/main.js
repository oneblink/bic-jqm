requirejs.config({
    baseUrl: '/_BICv3_/source',
    paths:{
        text: ['/_BICv3_/assets/js/text', 'https://raw.github.com/requirejs/text/latest/text'],
        jquery: ['/_BICv3_/assets/js/jquery.min', 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min'],
        jquerymobile: ['/_BICv3_/assets/js/jquery.mobile.min', 'http://code.jquery.com/mobile/1.2.0/jquery.mobile-1.2.0.min.js'],//'/_BICv3_/assets/js/jquery.mobile'
        underscore: ['/_BICv3_/assets/js/underscore-min', 'http://underscorejs.org/underscore-min'],
        backbone: ['/_BICv3_/assets/js/backbone', '../assets/js/backbone-min', 'http://backbonejs.org/backbone-min'],
        mustache: ['/_BICv3_/assets/js/mustache', 'https://raw.github.com/janl/mustache.js/master/mustache'],
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
