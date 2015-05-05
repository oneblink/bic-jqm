# BIC-jQM: Navigation Process

1. user clicks a hyperlink or button which changes the URL in the location bar

2. jQueryMobile triggers its [pagebeforeload](http://api.jquerymobile.com/1.3/pagebeforeload/)
  event

3. the [router](../src/router.js) parses the event data in its `routeRequest`
  method, identifying the destination interaction

4. the `prepareForView` method in the [InteractionModel](../src/model-interaction.js)
  prepares the data that the view will need, based on the interaction's type

5. the router waits until this is complete, then passes the data to a new
  [InteractionView](../src/view-interaction.js)

6. InteractionView uses Mustache templates and DOM manipulation to render
  the content of the interaction to the screen, based on the interaction's type
