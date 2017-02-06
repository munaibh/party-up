
define(['jquery', 'mustache', 'validate', 'text!templates/landing.html'], function($, Mustache, validate, LandingTmplt) {

  var LandingView = Backbone.View.extend({

    el: "body",

    events: {
      'click .signin' : 'openModal',
      'click .modal-outer' : 'closeModal',
      'submit .signin-form' : 'signIn',
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      // Generate and show landing template.
      var template = Mustache.render(LandingTmplt);
      this.$el.empty();
      $('head').find('link').attr("href", "assets/css/main.css");
      this.$el.html(template);
      // Validate Signin form
      $('.signin-form').validate({
        errorPlacement: function(error, element) {
          error.insertBefore(element);
        }
      });
    },

    signIn: function(e) {
      // Post login details.
      $.ajax({
        url: "/auth/",
        method: 'POST',
        data: $(e.target).serialize(),
        success: function(data) {
          if(data.status) {
            // On success redirect to timeline.
            Application.Router.navigate('/timeline');
            Backbone.history.loadUrl();
          }
          else {
            // On error display error message.
            $('.signin-form').find('.error').html('Username or Password are Incorrect.');
          }
        },
      });

      return false;
    },

    openModal: function() {
      // Show modal and panels.
      this.$el.find('.modal-outer').toggleClass('show');
    },

    closeModal: function(e) {
      // Close modal if background is clicked.
      if($(e.target).hasClass('modal-outer')) {
        this.$el.find('.modal-outer').removeClass('show');
      }
    }

  });

  // Landing module now returns our view
  return LandingView;

});
