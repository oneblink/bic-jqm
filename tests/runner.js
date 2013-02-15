requirejs.config({
    paths:{
        mocha: ['../assets/js/mocha'],
        chai: ['../assets/js/chai'],
        domReady: ['../assets/js/domReady'],

        text: ['/_BICv3_/assets/js/text', 'https://raw.github.com/requirejs/text/latest/text'],
        jquery: ['/_BICv3_/assets/js/jquery.min', 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min'],
        jquerymobile: ['/_BICv3_/assets/js/jquery.mobile.min', 'http://code.jquery.com/mobile/1.2.0/jquery.mobile-1.2.0.min.js'],//'/_BICv3_/assets/js/jquery.mobile'
        underscore: ['/_BICv3_/assets/js-built/CollectionB.min'],
        backbone: ['/_BICv3_/assets/js-built/CollectionB.min'],
        mustache: ['/_BICv3_/assets/js-built/CollectionB.min'],
        json2: ['/_BICv3_/assets/js/json2'],
        lawnchair: ['/_BICv3_/assets/js-built/CollectionB.min'],
        'lawnchair-indexed-db': ['/_BICv3_/assets/js/lawnchair-indexed-db'],
        'lawnchair-webkit-sqlite': ['/_BICv3_/assets/js-built/CollectionB.min'],
        BForms: ['/_BICv3_/assets/js/BlinkForms-jQueryMobile']


    },
    shim: {
        'mocha': {
            exports: 'mocha'
        },

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
    ['mocha', 'chai', 'domReady'],
    function (mocha, chai, domReady) {
        domReady(function () {
            
            var expect = chai.expect;
            mocha.setup('bdd');

            describe('Array', function(){
                describe('#indexOf()', function(){
                    it('should return -1 when the value is not present', function(){
                        expect([1,2,3].indexOf(5)).to.equal(-1);
                        expect([1,2,3].indexOf(0)).to.equal(-1);
                    });
                });
            });

            require(['api/API'], function(){
                mocha.run();
            });
        });
});
