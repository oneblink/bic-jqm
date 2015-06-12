define(function(){
  'use strict';

  /**
  Enum for Statuses on Form Models
  @NAME MODEL_STATUS_ENUM
  @readonly
  @enum {string}
  */
  var MODEL_STATUS = {
    SUBMITTED: 'Submitted',

    DRAFT: 'Draft',
    PENDING: 'Pending',

    FAILED_VALIDATION: 'Failed Validation'
  };

  return MODEL_STATUS;
});
