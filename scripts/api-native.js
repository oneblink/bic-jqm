define(
  [],
  function () {
    "use strict";
    var API = {
      getAnswerSpaceMap: function () {},
      getInteractionResult: function (iact, args, options) {},
      getForm: function () {},
      getDataSuitcase: function (suitcase, time) {},
      setPendingItem: function (formname, formaction, formdata) {},
      getLoginStatus: function () {},
      getFormList: function (formName) {},
      getFormRecord: function (formName, formAction, recordID) {}
    };

    return API;
  }
);

