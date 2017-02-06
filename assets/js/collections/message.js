define(['jquery', 'underscore', 'backbone', 'models/message'], function($, _, Backbone, MessageModel){

  // Initialize Message Collection.
  var MessageCollection = Backbone.Collection.extend({
    model: MessageModel,
    url: '/message/'
  });

  // Return the model for the module
  return MessageCollection;

});
