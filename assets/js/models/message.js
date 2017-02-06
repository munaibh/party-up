define(['jquery', 'underscore', 'backbone'], function($, _, Backbone){

  // Initialize Message Model.
  var MessageModel = Backbone.Model.extend({
    defaults: {
      status: true
    },
    urlRoot: '/message/',
  });

  // Return the model for the module
  return MessageModel;

});
