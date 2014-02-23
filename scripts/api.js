define(
  [],
  function () {
    "use strict";
    var API = {
      getAnswerSpaceMap: function () {
        return $.ajax('/_R_/common/3/xhr/GetConfig.php');
      },

      getInteractionResult: function (iact, args, options) {
        var getargs = '';
        if (args && typeof args === "object") {
          _.each(args, function (value, key) {
            if (value) {
              getargs += '&' + key + '=' + value;
            }
          });
        }
        return $.ajax('/_R_/common/3/xhr/GetAnswer.php?asn=' + window.BMP.BIC.siteVars.answerSpace + '&iact=' + iact + '&ajax=false' + getargs, options);
      },

      getForm: function () {
        return $.ajax('/_R_/common/3/xhr/GetForm.php?_v=3');
      },

      getDataSuitcase: function (suitcase, time) {
        return $.ajax('/_R_/common/3/xhr/GetMoJO.php?_id=' + window.BMP.BIC.siteVars.answerSpaceId + '&_m=' + suitcase + '&_lc=' + time, {dataType: "text"});
      },

      setPendingItem: function (formname, formaction, formdata) {
        return $.post('/_R_/common/3/xhr/SaveFormRecord.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formname + '&_action=' + formaction, formdata);
      },

      getLoginStatus: function () {
        return $.ajax('/_R_/common/3/xhr/GetLogin.php');
      }

    };

    return API;
  }
);
