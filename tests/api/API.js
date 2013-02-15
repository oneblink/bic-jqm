define(
    [ 'chai', '/_BICv3_/source/api/API.js'],
    function (chai, api) {
        var expect = chai.expect;

        describe('API Facade', function() {
            it('should be an object', function(){
                expect(api).to.be.an('object');
            });
            describe('answerSpace Config', function(){
                
                it('should return an answerSpace config when given correct params', function(done) {
                    api.getAnswerSpace('bb', null)
                        .done(function(data, status, xhr){
                            console.log(status);
                            expect(data).to.be.an('object');
                            expect(xhr).to.be.an('object');
                            expect(status).to.be.string('success');
                            done();
                        });
                });

                it('should die a horrible fiery death if the params are wrong', function(done){
                    api.getAnswerSpace(null, null)
                        .fail(function(xhr, status, error){
                            expect(xhr).to.be.an('object');
                            expect(status).to.be.string('error');
                            expect(error).to.be.string('Not Found');
                            done();
                        });
                });
            });
        });
    });

/*
define(
    ['jquery'],
    function ($) {
        var API = {
            getInteraction: function(answerspace, interaction, args, options){
                return $.ajax('/_BICv3_/xhr/GetInteraction.php?asn=' + answerspace + '&iact=' + interaction + args);
            },

            getAnswerSpace: function(answerspace, options){
                return $.ajax('/_BICv3_/xhr/GetApp.php?asn=' + answerspace);
            },

            getDataSuitcase: function(answerspace, datasuitcase, options){
                return $.ajax('/_BICv3_/xhr/GetDataSuitcase.php?asn=' + answerspace + '&ds=' + datasuitcase);
            }
        };

        return API;
    });
*/
