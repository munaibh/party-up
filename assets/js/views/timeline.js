// Filename: views/project/list
define(['jquery', 'underscore', 'backbone', 'mustache', 'text!templates/timeline.html', 'models/post', 'collections/post'
], function($, _, Backbone, Mustache, Timeline, PostM, PostC) {

  var TimelineView = Backbone.View.extend({

    className: "col",

    events: {
      'click .add-cta' : 'add',
      'click .action' : 'expand',
      'keyup .filter' : 'filter'
    },

    initialize: function(options) {
      // Initilize base variables
      this.pCount = 1;
      this.options = options;
      this.collection  = new PostC();
      this.title = "Recommended";
      // Filter by game if added.
      if(options.url != "Recommended") {
        this.title = options.url;
        this.collection.url = "/post/game/" + options.url;
      }
      // Conduct initial sync for first page.
      this.listenToOnce(this.collection, "sync", this.render);
      this.collection.fetch({ data: { page: 1 }, processData: true });
    },

    render: function(data, test) {
      // Render Inital Template
      templateData = { posts : data.toJSON() }
      templateSub  = { list : Timeline  }

      templateMain =
        '<header>' +
          '<h1>'+ this.title +'</h1>' +
          '<input type="text" placeholder="Enter a tag to filter..." class="filter">' +
        '</header>' +
        '<ul class="col-inner">{{>list}}</ul>';

      templateDist = Mustache.render(templateMain, templateData, templateSub);
      this.$el.append(templateDist);
      $('.colwrap').append(this.el);

      // Bind additional event handlers
      this.pCount += 1;
      var debounced = _.debounce(this.scroll.bind(this), 300);
      this.$el.find('.col-inner').scroll(debounced);

      // Render Other Columns if they Exist
      var options = this.options;
      if(!this.options.isEmpty) options.callback();
    },

    update: function(data, method) {
      // Update with more Posts
      $postWrapper = this.$el.find('.col-inner');
      templateData = { posts : data }
      templateDist = Mustache.render(Timeline, templateData);
      $postWrapper[method](templateDist);
    },

    scroll: function(e) {
      // Detect End Scroll
      var $el = $(e.target);
      var scrollHeight = $el[0].scrollHeight - 100;
      var scrollAmount = $el.scrollTop() + $el.innerHeight();
      if(scrollAmount > scrollHeight) this.fetch('append');
    },


    fetch: function(method)  {
      // Choose Whether to Get Latest of Next.
      var self = this;
      var param = (method != "append") ?  {type: "latest"} : {page: this.pCount};

      // Fetch the Data
      this.collection.fetch({
        data: param, processData: true
      })
      .done(function(data) {
        if(data.length > 0) self.update(data, method);
        self.pCount += 1;
      });
    },

    expand: function(e) {
      // Expand Post for User Info
      var $btn = $(e.target);
      var text = $btn.text();
      $btn.closest('li').toggleClass('open');
      $btn.text((text == "Expand") ? "Collapse" : "Expand");
      return false;
    },

    add: function(e) {
      // Get Post ID and Send Invite.
      $el = $(e.target).closest('li').data('post');
      var model = new PostM();
      model.set({id: $el});
      model.save({}, { success: function() {
        $(e.target).html("Sent");
      }});
    },

    filter: function(e) {
      // Retrieve URL and tag name.
      var data = this.collection.url;
      var arr = data.split('/tag');
      $postWrapper = this.$el.find('.col-inner');
      $postWrapper.empty();

      // If tag is valid append to url, else ignore.
      if($(e.target).val().trim() != "") {
        this.collection.url = arr[0] + "/tag/" + $(e.target).val();
        this.pCount = 1;
        this.fetch("append");
      }
      else {
        this.collection.url = arr[0];
        this.pCount = 1;
        this.fetch("append");
      }
    }

  });

  // Return Timeline module view
  return TimelineView;

});
