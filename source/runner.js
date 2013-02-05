requirejs.config({
    paths:{
        text: ['../assets/js/text', 'https://raw.github.com/requirejs/text/latest/text'],
        jquery: ['../assets/js/jquery.min', 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min'],
        'jquery.mobile': ['../assets/js/jquery.mobile.min', 'http://code.jquery.com/mobile/1.2.0/jquery.mobile-1.2.0.min.js'],
        underscore: ['../assets/js/underscore-min', 'http://underscorejs.org/underscore-min'],
        backbone: ['../assets/js/backbone-min', 'http://backbonejs.org/backbone-min'],
        mustache: ['../assets/js/mustache', 'https://raw.github.com/janl/mustache.js/master/mustache'],
        mocha: ['../assets/js/mocha'],
        should: ['../assets/js/should']
    },
    shim: {
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        }
    }
});

require(
    ['backbone', 'routers/router', 'jquery.mobile', 'mocha', 'should'],
    function (Backbone, Router, App, mocha, should) {
        //var router = new Router();
        //Backbone.history.start({pushState: true});

        assert = should.assert;

        mocha.setup('bdd');

        describe('Array', function(){
            describe('#indexOf()', function(){
                it('should return -1 when the value is not present', function(){
                    assert.equal(-1, [1,2,3].indexOf(5));
                    assert.equal(-1, [1,2,3].indexOf(0));
                });
            });
        });

        mocha.run();
});