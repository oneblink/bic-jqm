define(
  ['uuid'],
  function (uuid) {
    "use strict";
    var API = {
      getAnswerSpaceMap: function (user) {
        var userString = '';
        if (user) {
          userString = '&_username=' + user;
        }
        return Promise.resolve($.ajax('/_R_/common/3/xhr/GetConfig.php?_asn=' + window.BMP.BIC.siteVars.answerSpace + userString));
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
        return Promise.resolve($.ajax('/_R_/common/3/xhr/GetAnswer.php?asn=' + window.BMP.BIC.siteVars.answerSpace + '&iact=' + iact + '&ajax=false' + getargs, options));
      },

      getForm: function () {
        return Promise.resolve($.ajax('/_R_/common/3/xhr/GetForm.php?_v=3&_aid=' + window.BMP.BIC.siteVars.answerSpaceId));
      },

      getDataSuitcase: function (suitcase, time) {
        return Promise.resolve($.ajax('/_R_/common/3/xhr/GetMoJO.php?_id=' + window.BMP.BIC.siteVars.answerSpaceId + '&_m=' + suitcase + '&_lc=' + time, {dataType: "text"}));
      },

      setPendingItem: function (formname, formaction, formdata) {
        formdata._uuid = uuid.v4();
        return Promise.resolve($.post('/_R_/common/3/xhr/SaveFormRecord.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formname + '&_action=' + formaction, formdata));
      },

      getLoginStatus: function () {
        return Promise.resolve($.ajax('/_R_/common/3/xhr/GetLogin.php'));
      },

      getFormList: function (formName) {
        return Promise.resolve($.ajax('/_R_/common/3/xhr/GetFormList.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formName));
      },

      getFormRecord: function (formName, formAction, recordID) {
        return Promise.resolve($.ajax('/_R_/common/3/xhr/GetFormRecord.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formName + '&_tid=' + recordID + '&action=' + formAction));
      }

    };

    return API;
  }
);
