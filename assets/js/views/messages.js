
define(['jquery', 'underscore', 'backbone', 'validate', 'mustache', 'models/message', 'collections/message', 'text!templates/groups.html', 'text!templates/messages.html', 'text!templates/message.html'],
function($, _, Backbone, validate, Mustache, MessageM, MessageC, Groups, Messages, Item) {

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

  var MessageView = Backbone.View.extend({

    el: ".modal-outer",
    collection: new MessageC,
    events: {
      'click .group-item' : 'openChat',
      'click .gamertag': 'gamertag',
      'submit .message-form': 'sendMessage',
    },


    initialize: function(options) {
      // Initilize Base Components
      var self = this;
      this.options = options;
      // Retrieve messages from api.
      this.listenTo(this.collection, "sync change", this.render);
      this.collection.fetch();
    },

    render: function(data) {
      // Render Available Groups
      var $el =  this.$el.find('.panel-outer').eq(0);
      var data = _.groupBy(data.toJSON(), { host: true });
      var templateData = { host: data.true, member: data.false };
      var templateDist = Mustache.render(Groups, templateData);
      $el.empty().html(templateDist);
      this.$el.addClass('show panel');
    },

    openChat: function(e) {
      // Cache dom.
      var self = this;
      var target  = $(e.target);
      var sibling = target.siblings('.active');
      $chatWrapper = this.$el.find('.panel-outer').eq(1);
      $chatWrapper.empty();
      // Display chat.
      target.addClass('active');
      sibling.removeClass('active');
      this.updateChat('html');
      return false;
    },


    updateChat: function(method) {
      // Update Chat
      var self = this;
      var data = (method == "prepend") ? { type: "latest"} : null;
      var active = this.$el.find('.active');
      var collection = new MessageC();
      collection.url = "/message/" + active.data('id');

      collection.fetch({ data: data, processData: true })
      .done(function(data) {
        clearInterval(self.interval);
        if(data.length > 1) data = $.parseJSON(JSON.stringify(data)).reverse();
        self.renderChat(data, method);
       });

    },


    renderChat: function(data, method) {

      // Initilize Variables
      var self = this;
      $chatWrapper = this.$el.find('.panel-outer').eq(1);
      templateSub  = { message: Item };
      templateData = { messages: data, empty: _.isUndefined(data.status),
                       psn: this.options.psn, xbox: this.options.xbox};

      // Decide What Template to Load
      if(method == "html") {
        $chatWrapper.empty();
        templateDist = Mustache.render(Messages, templateData, templateSub);
      }
      else templateDist = Mustache.render(Item, templateData);

      // Render Template and Show
      if(method == "prepend") $chatWrapper = $chatWrapper.find(".messages");
      $chatWrapper[method](templateDist);
      $chatWrapper.removeClass('hide').addClass('show');

      // Reset Timer
      self.interval = setInterval(function() {
        self.updateChat('prepend');
      }, 5000);

    },

    sendMessage: function(e) {
      // Get message details.
      var self = this;
      var $target  = $(e.target);
      var formData = $target.serializeObject();
      formData.postid = this.$el.find('.active').data('id');

      // Send Message.
      var model = new MessageM();
      model.save(formData).done(function() {
        self.updateChat('prepend');
        $target.trigger("reset");
      });
      return false;

    },

    gamertag: function(e) {
      // Get Gamertag Details.
      var self = this;
      var model = new MessageM();
      var $chatForm   = $('.message-form');
      var activeGroup = this.$el.find('.active').data('id');
      var gamertag = e.target.innerHTML;

      // Send Gamertag and Reset Form.
      model.save({ message: gamertag, postid: activeGroup}).done(function() {
        self.updateChat('prepend');
        $chatForm.trigger("reset");
      });

      // Prevent default action.
      return false;
    },

    remove: function() {
      // Unbind events and empty view.
      this.$el.off();
      this.$el.find('.panel-outer').empty();
      this.stopListening();
      // Stop message retrieval.
      clearInterval(this.interval);
      return this;
    }

  });

  // Message view is returned.
  return MessageView;

});
