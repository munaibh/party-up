define(['jquery', 'underscore', 'backbone', 'models/invite'], function($, _, Backbone, InviteModel){

  // Initialize Invite Collection.
  var InviteCollection = Backbone.Collection.extend({
    model: InviteModel,
    url: '/invite/'
  });

  // Return the model for the module
  return InviteCollection;

});
