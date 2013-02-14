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
