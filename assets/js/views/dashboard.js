
define(['jquery', 'underscore', 'backbone', 'validate', 'mustache', 'text!templates/dashboard.html',
        'views/timeline', 'models/post', 'collections/post', 'views/messages', 'views/notifications', 'models/user'
        ],
function($, _, Backbone, validate, Mustache, Dashboard, Timeline, PostM, PostC, Messages, Notification, UserM) {


  $.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
      if (o[this.name] !== undefined) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  };

  var DashboardView = Backbone.View.extend({

    el: "body",

    events: {
      'click .modal-outer' : 'close',
      'submit .post-form' : 'addPost',
      'click .compose' : function(e) { this.openModal(e, 'form'); return false; },
      'click .messages' : function(e) { this.openModal(e, 'panel'); return false; },
      'click .notification' : function(e) { this.openModal(e, 'notif'); return false; },
      'click .logout' : 'logout',
    },


    initialize: function(options) {
      var self = this;
      this.options = options;
      this.render(options);
      // Retrieve posts automatically
      this.interval = setInterval(self.newPosts.bind(self), 30000);
      // Validate post form.
      $('.post-form').validate({
        rules: {
          message: { required: true, },
          size: { required: true, },
          game: { required: true, },
          tags: { required: true, },
        },
        errorPlacement: function(error, element) {
          error.insertBefore(element);
        }
      });
    },

    render: function(data) {
      // Base Dashboard Components.
      var templateData = { user: data};
      var template = Mustache.render(Dashboard, templateData);
      this.$el.empty();
      $('head').find('link').attr("href", "assets/css/style.css");
      this.$el.html(template);
      // Generate Columns.
      this.subviews = [];
      this.interests = templateData.user.interests;
      this.interests.unshift("Recommended");
      this.generate();
    },

    generate: function() {
      // Retrieve interests
      var self = this;
      var interests = this.interests;
      // Get first index and remove from array.
      var startItem = _.first(interests);
      var nextItems = _.rest(interests);

      // Generate new view with start item as key.
      self.subviews[startItem] = new Timeline({
        url: startItem,
        callback: _.bind(self.generate, self),
        isEmpty: _.isEmpty(nextItems)
      });
      // Set interets to remaining interests.
      this.interests = nextItems;

    },

    addPost: function(e) {

      var self = this;
      var $form = $(e.target);
      var model = new PostM();
      model.save($form.serializeObject())
      .done(function() {
        clearInterval(self.interval);
        self.newPosts();
        $form.parent().removeClass('show');
        $form.trigger('reset');
        self.interval = setInterval(self.newPosts.bind(self), 30000);
      });
      return false;

    },

    newPosts: _.debounce(function() {
      // Assign Variables
      var self = this;
      var model = new PostC();
      // Fetch Latest Post Data
      model.fetch({
        data: {type: "latest"},
        processData: true,
      })
      // When Complete Assign to correct columns.
      .done(function(data) {
        if(data.length>0) {
          _.each(self.options.interests, function(column) {
            var newData = _.where(data, {game: column});
            if(column == "Recommended") newData = data;
            if(newData.length>0) self.subviews[column].update(newData.reverse(), 'prepend');
          });
        }
      });
    }, 200),

    openModal: function(e, modal) {

      // Empty panels and hide.
      $('.panel-outer').empty().removeClass('show');
      $('.modal-outer').attr('class', 'modal-outer');
      if(this.message) this.message.remove();

      // Show message panel.
      if(modal == "panel") {
        this.message = new Messages({
          psn: this.options.psn,
          xbox: this.options.xbox
        });
      }
      // Show message and notification panel.
      if(modal == "notif") new Notification();
      if(modal == "form")  $(".modal-outer").addClass("form show");

    },

    logout: function() {
      // Logout and redirect to landing.
      var id = this.options.id;
      var model = new UserM({id: id});
      model.destroy().then(null, function() {
        location.reload();

      });
    },

    close: function(e) {
      // If modal outer is clicked hide modals.
      if($(e.target).hasClass('modal-outer')) {
        if($('.panel-outer.show').length == 1) this.message.remove();
        $(".panel-outer").removeClass("show");
        $(e.target).attr('class', 'modal-outer');
      }
    },

    remove: function() {
      // Unbind events and empty view.
      this.$el.off();
      this.$el.empty();
      this.stopListening();
      if(this.message) this.message.remove();
      clearInterval(this.interval);
      return this;
    }

  });

  // Dashboard module now returns our view
  return DashboardView;

});
