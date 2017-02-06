define(['jquery', 'underscore', 'backbone'], function($, _, Backbone){

  // Initialize Post Model.
  var PostModel = Backbone.Model.extend({
    defaults: {

    },
    urlRoot: '/post/',
    page: '1'
  });

  // Return the model for the module
  return PostModel;

});
