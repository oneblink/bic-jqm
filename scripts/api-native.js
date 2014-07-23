/*global cordova: true */
define(
  ['uuid'],
  function (uuid) {
    "use strict";
    var API = {
      getAnswerSpaceMap: function () {
        return new Promise(function (resolve, reject) {
          cordova.offline.retrieveContent(
            function (data) {
              resolve(JSON.parse(data));
            },
            reject,
            '/_R_/common/3/xhr/GetConfig.php'
          );
        });
      },

      getInteractionResult: function (iact, args) {
        var getargs = '';
        if (args && typeof args === "object") {
          _.each(args, function (value, key) {
            if (value) {
              getargs += '&' + key + '=' + value;
            }
          });
        }
        return new Promise(function (resolve, reject) {
          cordova.offline.retrieveContent(
            resolve,
            reject,
            '/_R_/common/3/xhr/GetAnswer.php?asn=' + window.BMP.BIC.siteVars.answerSpace + '&iact=' + iact + '&ajax=false' + getargs
          );
        });
      },

      getForm: function () {
        return new Promise(function (resolve, reject) {
          cordova.offline.retrieveContent(
            function (data) {
              resolve(JSON.parse(data));
            },
            reject,
            '/_R_/common/3/xhr/GetForm.php?_v=3'
          );
        });
      },

      getDataSuitcase: function (suitcase, time) {
        return new Promise(function (resolve, reject) {
          cordova.offline.retrieveContent(
            resolve,
            reject,
            '/_R_/common/3/xhr/GetMoJO.php?_id=' + window.BMP.BIC.siteVars.answerSpaceId + '&_m=' + suitcase + '&_lc=' + time
          );
        });
      },

      setPendingItem: function (formname, formaction, formdata) {
        formdata._uuid = uuid.v4();
        return $.post('/_R_/common/3/xhr/SaveFormRecord.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formname + '&_action=' + formaction, formdata);
      },

      getLoginStatus: function () {
        return new Promise(function (resolve, reject) {
          cordova.offline.retrieveContent(
            resolve,
            reject,
            '/_R_/common/3/xhr/GetLogin.php'
          );
        });
      },

      getFormList: function (formName) {
        return new Promise(function (resolve, reject) {
          cordova.offline.retrieveContent(
            resolve,
            reject,
            '/_R_/common/3/xhr/GetFormList.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formName
          );
        });
      },

      getFormRecord: function (formName, formAction, recordID) {
        return new Promise(function (resolve, reject) {
          cordova.offline.retrieveContent(
            resolve,
            reject,
            '/_R_/common/3/xhr/GetFormRecord.php?_fn=' + formName + '&_tid=' + recordID + '&action=' + formAction
          );
        });
      }
    };

    return API;
  }
);
