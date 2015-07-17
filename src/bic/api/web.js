define(function (require) {
  'use strict';

  // foreign modules

  var $ = require('jquery');
  var Promise = require('feature!promises');
  var uuid = require('uuid');

  // this module

  var API = {
    GET_CONFIG: '/_R_/common/3/xhr/GetConfig.php',
    GET_FORM: '/_R_/common/3/xhr/GetForm.php',
    GET_MOJO: '/_R_/common/3/xhr/GetMoJO.php',
    SAVE_FORM_RECORD: '/_R_/common/3/xhr/SaveFormRecord.php',

    getAnswerSpaceMap: function (user) {
      var userString = '';
      var url;
      if (user) {
        userString = '&_username=' + user;
      }
      url = this.GET_CONFIG + '?_asn=' + window.BMP.BIC.siteVars.answerSpace.toLowerCase() + userString;
      return $.ajax(url);
    },

    getInteractionResult: function (iact, args, options) {
      var getargs = '';
      if (args && $.isPlainObject(args)) {
        getargs = $.param(args);
        getargs = getargs.length ? '&' + getargs : '';
      }
      return $.ajax('/_R_/common/3/xhr/GetAnswer.php?asn=' + window.BMP.BIC.siteVars.answerSpace.toLowerCase() + '&iact=' + iact + '&ajax=false' + getargs, options);
    },

    getForm: function () {
      var url = this.GET_FORM + '?_v=3&_aid=' + window.BMP.BIC.siteVars.answerSpaceId;
      return Promise.resolve($.ajax(url));
    },

    getDataSuitcase: function (suitcase, time) {
      var url = this.GET_MOJO + '?_id=' + window.BMP.BIC.siteVars.answerSpaceId + '&_m=' + suitcase;
      return $.ajax(url, {
        dataType: 'text',
        headers: {
          'If-Modified-Since': (new Date(time)).toUTCString()
        }
      });
    },

    setPendingItem: function (formname, formaction, formdata) {
      var url = this.SAVE_FORM_RECORD + '?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formname + '&_action=' + formaction;
      formdata._uuid = uuid.v4();
      formdata._submittedTime = $.now();
      formdata._submittedTimezoneOffset = (new Date()).getTimezoneOffset();
      formdata._submittedTimezoneOffset /= -60;
      return $.ajax({
        type: 'POST',
        url: url,
        data: formdata
      });
    },

    getLoginStatus: function () {
      return $.ajax('/_R_/common/3/xhr/GetLogin.php');
    },

    getFormList: function (formName) {
      return $.ajax('/_R_/common/3/xhr/GetFormList.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formName);
    },

    getFormRecord: function (formName, formAction, recordID) {
      return $.ajax('/_R_/common/3/xhr/GetFormRecord.php?_asid=' + window.BMP.BIC.siteVars.answerSpaceId + '&_fn=' + formName + '&_tid=' + recordID + '&action=' + formAction);
    }

  };

  return API;
});
