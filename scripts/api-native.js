/*global cordova: true */
define(
  [],
  function () {
    "use strict";
    var API = {
      getAnswerSpaceMap: function (options) {
        cordova.offliner.retrieveContent(
          options.success,
          options.error,
          {
            url: '/_R_/common/3/xhr/GetConfig.php'
          }
        );
      },

      getInteractionResult: function (options) {
        //return $.ajax('/_R_/common/3/xhr/GetAnswer.php?asn=' + window.BMP.BIC.siteVars.answerSpace + '&iact=' + iact + '&ajax=false' + getargs, options);
        cordova.offliner.retrieveContent(
          options.success,
          options.error,
          {
            url: '/_R_/common/3/xhr/GetConfig.php'
          }
        );
      },

      getForm: function (options) {
        //return $.ajax('/_R_/common/3/xhr/GetForm.php?_v=3');
        cordova.offliner.retrieveContent(
          options.success,
          options.error,
          {
            url: '/_R_/common/3/xhr/GetConfig.php'
          }
        );
      },

      getDataSuitcase: function (options) {
        //return $.ajax('/_R_/common/3/xhr/GetMoJO.php?_id=' + window.BMP.BIC.siteVars.answerSpaceId + '&_m=' + suitcase + '&_lc=' + time, {dataType: "text"});
        cordova.offliner.retrieveContent(
          options.success,
          options.error,
          {
            url: '/_R_/common/3/xhr/GetConfig.php'
          }
        );
      },

      setPendingItem: function (options) {
        //return $.post('/_R_/common/3/xhr/SaveFormRecord.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formname + '&_action=' + formaction, formdata);
        cordova.offliner.retrieveContent(
          options.success,
          options.error,
          {
            url: '/_R_/common/3/xhr/GetConfig.php'
          }
        );
      },

      getLoginStatus: function (options) {
        //return $.ajax('/_R_/common/3/xhr/GetLogin.php');
        cordova.offliner.retrieveContent(
          options.success,
          options.error,
          {
            url: '/_R_/common/3/xhr/GetConfig.php'
          }
        );
      },

      getFormList: function (options) {
        //return $.ajax('/_R_/common/3/xhr/GetFormList.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formName);
        cordova.offliner.retrieveContent(
          options.success,
          options.error,
          {
            url: '/_R_/common/3/xhr/GetConfig.php'
          }
        );
      },

      getFormRecord: function (options) {
        //return $.ajax('/_R_/common/3/xhr/GetFormRecord.php?_fn=' + formName + '&_tid=' + recordID + '&action=' + formAction);
        cordova.offliner.retrieveContent(
          options.success,
          options.error,
          {
            url: '/_R_/common/3/xhr/GetConfig.php'
          }
        );
      }

    };

    return API;
  }
);
