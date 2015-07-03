Error Summary
=============
BIC has the ability to render a tappable list of invalid fields. It does this by utilising the BlinkForms v3.3.6+ error system. If Blink Forms is lower than 3.3.6, the summary will not be shown.

The summary is a [jQuery Mobile ListView](http://api.jquerymobile.com/1.3/listview/) widget using Swatch 'a'. By default, 4 records are shown, unless 'show more' is clicked, when all errors in the form are shown.

To turn this functionality off at a global level, use the following code (assuming requirejs ["simplified CommonJS wrapping"](http://requirejs.org/docs/whyamd.html#sugar) )

    var app = require('bic/model-application');
    app.set('displayErrorSummary', false)



Customisation
=============
You can change either the Template for the &lt;li&gt; items or completely replace the entire view.

Overriding the entire view
--------------------------
Simply write your own Backbone.View and put the constructor function on BIC.views.FormErrorSummary

eg:

    var MyCustomView = Backbone.View.extend({
      myCustomFunction: function(){},
      render: function(){}
    });
    var app = require('bic/model-application');
    
    app.views.FormErrorSummary = MyCustomView


Override the template
---------------------

If you just want to tweak how the &lt;li&gt; look or behave, then you can modify the static property `#template(viewModel)` to return the html.

viewModel is defined as

    {
      invalidElements: {array},       //an array of BlinkForm Fields
      moreAvailable: {boolean},       //true if show all
      remaining: {Number}             //the number of invalid elements not shown.
    };

eg

    var FormErrorSummary = require('bic/view-form-error-summary-list-view');
    
    FormErrorSummary.template = function(viewModel){ 
      return "a template string";
    }

    FormErrorSummary.limit = 120; //adjust the default number of errors shown.