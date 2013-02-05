define(
    ['jquery'],
    function ($) {
        var API = {
            getInteraction: function(answerspace, interaction, options){
                console.log('Beginning AJAX for Interaction');
                return $.ajax('/_BICv3_/xhr/GetInteraction.php?asn=' + answerspace + '&iact=' + interaction);
            },

            getAnswerSpace: function(answerspace, options){
                console.log('Beginning AJAX for answerSpace');
                return $.ajax('/_BICv3_/xhr/GetApp.php?asn=' + answerspace);
            }
        };

        return API;
    });