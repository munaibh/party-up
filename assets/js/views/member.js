
define(['jquery', 'underscore', 'backbone', 'validate', 'mustache', 'text!templates/member.html', 'models/user'],
function($, _, Backbone, validate, Mustache, Member, UserM) {


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

  var MemberView = Backbone.View.extend({

    el: "body",

    events: {
      'submit #MyForm' : 'updateDetails'
    },


    initialize: function(options) {
      // Get member details and pass to render.
      this.model = new UserM();
      this.listenTo(this.model, "sync", this.render);
      this.model.fetch();

    },

    render: function(data) {
      // Generate profile template.
      var template = Mustache.render(Member);
      this.$el.empty();
      $('head').find('link').attr("href", "assets/css/main.css");
      this.$el.html(template);

      // Use retrieved details to populate fields.
      function populate(frm, data) {
        $.each(data, function(key, value){
          $('[name='+key+']', frm).val(value);
        });
      }
      var data = JSON.stringify(data.toJSON());
      populate('#MyForm', $.parseJSON(data));

    },

    updateDetails: function(e) {
      // POST changed user details and redirect.
      this.model.save($(e.target).serializeObject())
      .done(function() {
        Application.Router.navigate('/timeline');
        Backbone.history.loadUrl();
      });

      return false;
    }

  });

  // Member module now returns our view
  return MemberView;

});
