
define(['jquery', 'underscore', 'backbone', 'models/user', 'views/landing', 'views/register', 'views/dashboard', 'views/member'],
function($, _, Backbone, Status, LandingView, RegisterView, DashboardView, MemberView){

  $.ajaxPrefilter( function(options, originalOptions, jqXHR) {
      options.url = "api" + options.url;
  });

  var AppRouter = Backbone.Router.extend({

    routes: {
      "" : "index",
      "timeline": "main",
      "settings": "settings",
      "register": "register",
      '*notFound': 'notFound',
    },

    execute: function(callback, args) {
      var self = this;
      // Define Acceptable Routes.
      if(this.dashboard) this.dashboard.remove();
      var nextRoute = Backbone.history.getFragment();
      var authRoute = ["settings", "timeline"];

      var model = new Status();
      model.fetch().done(function(data) {
        // Cache Variables and Data.
        self.user = data;
        var loggedIn = data.status;
        var checkRoute = authRoute.indexOf(nextRoute);
        // Auth Route Conditional
        if(checkRoute >=0) {
          if(loggedIn) callback.apply(self, args);
          else Application.Router.navigate("/", true);
        }
        // No Auth Conditional
        else {
          callback.apply(self, args);
        }
      });
    },

    index: function() {
      this.landing = new LandingView();
    },

    register: function() {
      this.register = new RegisterView();
    },

    main: function() {
      this.dashboard = new DashboardView(this.user);
    },

    notFound: function() {
      alert("Page doesnt exist.");
    },

    settings: function() {
      this.member = new MemberView();
    }

  });

  var initialize = function(){
    Application.Router = new AppRouter();
    Backbone.history.start({
      urlRoot: "/PartyUpBeta/app/"
    });
  }

  return { initialize: initialize };

});
