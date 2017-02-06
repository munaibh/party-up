define(['jquery', 'underscore', 'backbone', 'models/post'], function($, _, Backbone, PostModel){

  // Initialize Post Collection.
  var PostCollection = Backbone.Collection.extend({
    model: PostModel,
    url: '/post/'
  });

  // Return the model for the module
  return PostCollection;

});
