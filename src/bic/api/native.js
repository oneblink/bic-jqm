/*globals cordova:false*/
define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');
  var Promise = require('bic/promise');

  // local modules

  var apiWeb = require('bic/api/web');

  // this module

  var API = {
    getAnswerSpaceMap: function (user) {
      return new Promise(function (resolve, reject) {
        var userString = '';
        if (user) {
          userString = '&_username=' + user;
        }
        cordova.offline.retrieveContent(
          function (data) {
            resolve(JSON.parse(data));
          },
          reject,
          {
            url: '/_R_/common/3/xhr/GetConfig.php?_asn=' + window.BMP.BIC.siteVars.answerSpace.toLowerCase() + userString
          }
        );
      });
    },

    getInteractionResult: apiWeb.getInteractionResult,

    getForm: function () {
      return new Promise(function (resolve, reject) {
        cordova.offline.retrieveContent(
          function (data) {
            resolve(JSON.parse(data));
          },
          reject,
          {
            url: '/_R_/common/3/xhr/GetForm.php?_v=3&_aid=' + window.BMP.BIC.siteVars.answerSpaceId
          }
        );
      });
    },

    getDataSuitcase: function (suitcase) {
      return new Promise(function (resolve, reject) {
        cordova.offline.retrieveContent(
          resolve,
          reject,
          {
            url: apiWeb.GET_MOJO + '?_id=' + window.BMP.BIC.siteVars.answerSpaceId + '&_m=' + suitcase
          }
        );
      });
    },

    setPendingItem: apiWeb.setPendingItem,

    getLoginStatus: apiWeb.getLoginStatus,

    getFormList: function (formName) {
      return new Promise(function (resolve, reject) {
        cordova.offline.retrieveContent(
          function (data) {
            resolve($.parseXML(data));
          },
          reject,
          {
            url: '/_R_/common/3/xhr/GetFormList.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formName
          }
        );
      });
    },

    getFormRecord: function (formName, formAction, recordID) {
      return new Promise(function (resolve, reject) {
        cordova.offline.retrieveContent(
          function (data) {
            resolve($.parseXML(data));
          },
          reject,
          {
            url: '/_R_/common/3/xhr/GetFormRecord.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formName + '&_tid=' + recordID + '&action=' + formAction
          }
        );
      });
    }
  };

  return API;
});
