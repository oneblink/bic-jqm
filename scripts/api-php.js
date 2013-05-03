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
        return $.ajax('/_BICv3_/xhr/GetInteraction.php?asn=' + answerspace + '&iact=' + interaction + argstring, options);
      },

      getAnswerSpace: function (answerspace) {
        return $.ajax('/_BICv3_/xhr/GetApp.php?asn=' + answerspace);
      },

      getDataSuitcase: function (answerspace, datasuitcase) {
        return $.ajax('/_BICv3_/xhr/GetDataSuitcase.php?asn=' + answerspace + '&ds=' + datasuitcase);
      },

      getForm: function (answerspace, form) {
        return $.ajax('/_BICv3_/xhr/GetForm.php?asn=' + answerspace + '&form=' + form);
      },

      setPendingItem: function (answerspaceid, formname, formaction, formdata) {
        return $.post('/_R_/common/3/xhr/SaveFormRecord.php?_asid=' + answerspaceid + '&_fn=' + formname + '&_action=' + formaction, formdata);
      }
    };

    return API;
  }
);