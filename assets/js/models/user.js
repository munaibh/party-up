define(['jquery', 'underscore', 'backbone'], function($, _, Backbone){

  // Initialize User Model.
  var UserModel = Backbone.Model.extend({
    defaults: {
      status: false,
    },
    urlRoot: '/auth/',
  });

  // Return the model for the module
  return UserModel;

});
