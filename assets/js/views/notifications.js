
define(['jquery', 'underscore', 'backbone', 'mustache', 'models/invite', 'collections/invite', 'text!templates/invite.html'],
function($, _, Backbone, Mustache, InviteM, InviteC, Invite) {


  var NotificationView = Backbone.View.extend({

    el: ".modal-outer",
    collection: new InviteC,
    events: {
      'click .accept' : 'choice',
      'click .cancel' : 'delete',
      'click .decline': 'choice',
    },

    initialize: function(options) {
      // Fetch notifications.
      this.listenTo(this.collection, "sync change", this.render);
      this.collection.fetch();
    },

    render: function(data) {
      // Retrieve and store data.
      var $el =  this.$el.find('.panel-outer').eq(0);
      var data = _.groupBy(data.toJSON(), { host: true });
      // Initilize templates.
      var templateData = { host: data.true, player: data.false };
      var templateDist = Mustache.render(Invite, templateData);
      // Append template and show panel.
      $el.empty().html(templateDist);
      this.$el.addClass('show panel');
    },

    choice: function(e) {
      // Cache  invite variables
      var $el = $(e.target);
      var invite = $el.parent().data('id');
      // If class is accept decesion is 1, else 2.
      var choice = ($el.attr('class') == "accept") ? 1 : 2;
      // Send invite to rest api.
      var model = new InviteM();
      model.save({invite: invite, status: choice}, {
        success: function() {
          $el.parent().remove();
        }
      });
    },

    delete: function(e) {
      // Cache Variables
      var $el = $(e.target).parent();
      var invite = $el.data('id');
      var model = new InviteM({id: invite});
      // Send delete request to rest api.
      model.destroy({
        success: function(data) {
          if(data.get('status')) $el.remove();
        }
      });
    }

  });

  // Notification view is returned.
  return NotificationView;

});
