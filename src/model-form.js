/**

  Represents a BlinkForms object. Held in the forms collection on window.BMP.BIC.forms
  @module Form
*/
define(
  ['api'],
  function (API) {
    'use strict';

    /**
      A BlinkForms Model
      @class
      @alias Form
    */
    var Form = Backbone.Model.extend({
      idAttribute: '_id',


/**
  @callback DestinationDefinition~AfterFormActionCallback

  @description If specified, this callback will be in control of what happens when the user **leaves** a form. Note
  that the programmer has complete control, and **must handle everything, including redirecting to other
  interactions**

  @param {Object} details             - Details about the user action
  @param {Object} details.model       - The BlinkForms model being saved. Using details.model.data() will return a promise with the first parameter being the users entry into the form.
  @param {string} details.userAction  - The action the user took. See [User Actions]{@link USER_ACTION} for a list of the enums
*/
/**
  @typedef  {Object} DestinationDefinition

  @property {DestinationDefinition~AfterFormActionCallback} add             - Custom return Interactions for the 'add' action
  @property {DestinationDefinition~AfterFormActionCallback} edit            - Custom return Interactions for the 'edit' action
  @property {DestinationDefinition~AfterFormActionCallback} view            - Custom return Interactions for the 'view' action
*/

/**
  @description Allows overriding of the BlinkForm 'Add' or 'Edit' Actions onFormLeave function.

  @param {DestinationDefinition}  destinationsObj - A map of actions that will have
  {@link DestinationDefinition} custom return interactions. Currently only 'add'
  or 'edit' action are supported.

  @example
//First wait for the forms to be loaded from the server
window.BMP.BIC3.forms.whenUpdated().then(function(){
  //Get the BlinkForm Model for form 'my_form_id'
  var myBlinkForm = BMP.BIC3.forms.get('my_form_id');

  //set the destination for the 'add' action
  myBlinkForm.setActionDestination({
    'add': function(details){

      //request the data entered by the user
      details.model.data().then(function(formActionData){
        //do stuff based on form data eg; go to a specific interaction:
        if (formActionData.name === 'simon' ){
          return window.BMP.BIC.goToInteraction('special_interactions/simon/thanks');
        }

        return window.BMP.BIC.view.back();

      });
    }
  });
});
*/
      setActionDestination: function(destinationsObj){
        var current;

        current = this.get('onFormLeaveInteraction') || {};
        this.set('onFormLeaveInteraction', _.extend({}, current, destinationsObj) );
      },

      populate: function () {
        var model = this;
        API.getForm(this.id).then(
          function (data) {
            model.save({
              definition: data.definition,
              contentTime: Date.now()
            });
          }
        );
      }
    });

    return Form;
  }
);
