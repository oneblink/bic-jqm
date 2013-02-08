define(
    ['jquery'],
    function ($) {
        var API = {
            getInteraction: function(answerspace, interaction, args, options){
                var argstring = '';
                if (args){
                    argstring = '&args=' + args;
                }
                return $.ajax('/_BICv3_/xhr/GetInteraction.php?asn=' + answerspace + '&iact=' + interaction + argstring);
            },

            getAnswerSpace: function(answerspace, options){
                return $.ajax('/_BICv3_/xhr/GetApp.php?asn=' + answerspace);
            }
        };

        return API;
    });