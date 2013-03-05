define(
  ['jquery'],
  function ($) {
    "use strict";
    var API = {
      getInteraction: function (answerspace, interaction, args, options) {
        var argstring = '';
        if (args) {
          $.each(args, function (key, value) {
            argstring += "&" + key + "=" + value;
          });
        }
        return $.ajax('/_BICv3_/xhr/GetInteraction.php?asn=' + answerspace + '&iact=' + interaction + argstring);
      },

      getAnswerSpace: function (answerspace, options) {
        return $.ajax('/_BICv3_/xhr/GetApp.php?asn=' + answerspace);
      },

      getDataSuitcase: function (answerspace, datasuitcase, options) {
        return $.ajax('/_BICv3_/xhr/GetDataSuitcase.php?asn=' + answerspace + '&ds=' + datasuitcase);
      }
    };

    return API;
  }
);
