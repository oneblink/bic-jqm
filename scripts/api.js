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
            getargs += '&' + key + '=' + value;
          });
        }
        return $.ajax('/_R_/common/3/xhr/GetAnswer.php?asn=' + window.BMP.siteVars.answerSpace + '&iact=' + iact + '&ajax=false' + getargs, options);
      },

      getForm: function (form) {
        return $.ajax('/_BICv3_/xhr/GetForm.php?asn=' + window.BMP.siteVars.answerSpace + '&form=' + form);
      },

      getDataSuitcase: function (suitcase, time) {
        return $.ajax('/_R_/common/3/xhr/GetMoJO.php?_id=' + window.BMP.siteVars.answerSpaceId + '&_m=' + suitcase + '&_lc=' + time, {dataType: "text"});
      },

      setPendingItem: function (formname, formaction, formdata) {
        return $.post('/_R_/common/3/xhr/SaveFormRecord.php?_asid=' + window.BMP.siteVars.answerSpaceId + '&_fn=' + formname + '&_action=' + formaction, formdata);
      },

      getLoginStatus: function () {
        return $.ajax('/_R_/common/3/xhr/GetLogin.php');
      }

    };

    return API;
  }
);
