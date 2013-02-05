requirejs.config({
    paths:{
        text: ['../assets/js/text', 'https://raw.github.com/requirejs/text/latest/text'],
        jquery: ['../assets/js/jquery.min', 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min'],
        'jquery.mobile': ['../assets/js/jquery.mobile.min', 'http://code.jquery.com/mobile/1.2.0/jquery.mobile-1.2.0.min.js'],
        underscore: ['../assets/js/underscore-min', 'http://underscorejs.org/underscore-min'],
        backbone: ['../assets/js/backbone', '../assets/js/backbone-min', 'http://backbonejs.org/backbone-min'],
        mustache: ['../assets/js/mustache', 'https://raw.github.com/janl/mustache.js/master/mustache'],
        json2: ['../assets/js/json2'],
        lawnchair: ['../assets/js/lawnchair'],
        'lawnchair-indexed-db': ['../assets/js/lawnchair-indexed-db'],
        'lawnchair-webkit-sqlite': ['../assets/js/lawnchair-webkit-sqlite'],
        bforms3: ['../assets/js/bforms3.min']
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
            deps: ['lawnchair']
        },
        'lawnchair-webkit-sqlite': {
            deps: ['lawnchair']
        }
    }
});

require(
    ['backbone', 'routers/v3/router', 'views/v3/interaction', 'models/v3/application', 'jquery', 'jquery.mobile'],
    function (Backbone, router, InteractionView, app, $) {
        //jQuery Mobile attributes we need to disable for routing
        $.mobile.linkBindingEnabled = false;
        $.mobile.hashListeningEnabled = false;

        Backbone.history.start({pushState: true, silent: true});

        var urlfragmentparts = Backbone.history.fragment.split('/');
        app.set("siteName", urlfragmentparts[0]).fetch();

        var tempview = new InteractionView({
            el: '[id="' + urlfragmentparts[urlfragmentparts.length - 1] + '"]'
        });
        app.set("currentPage", tempview);

        // TODO: delay until window.load
        $('body').on('pagechange', function(){
            router.clean();
        });
});
