define(['jquery', 'underscore', 'backbone'], function($, _, Backbone){

  // Initialize Invite Model.
  var InviteModel = Backbone.Model.extend({
    defaults: {
      status: true
    },
    urlRoot: '/invite/',
    page: '1'
  });

  // Return the model for the module
  return InviteModel;

});
