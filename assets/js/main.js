
// Setting up NameSpaces
window.Application = {
  Router: {},
  Models: {}
};

// Configure RequireJS
requirejs.config({
  paths: {
    jquery: 'libs/jquery',
    underscore: 'libs/underscore',
    backbone: 'libs/backbone',
    validate: 'libs/validate',
    mustache: 'libs/mustache',
  }
});

// Load app module
require(['app'], function(App) {
  
  App.initialize();
});
