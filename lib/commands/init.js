var path = require('path');
var _ = require('underscore');

// --css=css|scss|less
// --js=js|coffee|next.js
// --html=html|jade

// --skip-template-css=true|false
// --skip-template-js=true|false
// --skip-template-html=true|false
// --skip-flow-router

// --skip-route-template

Command.create({
  name: 'init',
  usage: 'maka init',
  description: 'Initialize your project structure.'
}, function (args, opts) {
  // the app name is either the first argument to the
  // generator or inferred from the current directory.
  // if no appname is provided, we assume we're already
  // in the project directory.
  var appName = args[0] || path.basename(process.cwd());
  var projectDirectory = args[0] || process.cwd();
  var orbitDirectory = path.join(projectDirectory, 'app', 'client');

  var config = {
    engines: {
      html: opts.html || 'html',
      js: opts.js || 'js',
      css: opts.css || 'css'
    },
    template: {
      html: !_.has(opts, 'skip-template-html'),
      js: !_.has(opts, 'skip-template-js'),
      css: !_.has(opts, 'skip-template-css') && !opts.orbit
    },
    route: {
      template: !_.has(opts, 'skip-route-template')
    },
    generator: {
      comments: !_.has(opts, 'skip-generator-comments')
    }
  };

  var context = {
    app: appName,
    config: config
  };

  var self = this;

  return CurrentConfig.withValue(config, function () {
    // copy the project template directory to the project directory
    self.copyTemplateDirectory('project', projectDirectory, context);

    // create an empty meteor project in the app folder
    self.createEmptyMeteorProject('app', {cwd: projectDirectory});

    var appDirectory = path.join(projectDirectory, 'app');

    // copy the meteor app folder template to our new app
    self.copyTemplateDirectory('app', appDirectory, context);

    // invoke the right generators for some default files
    Maka.findGenerator('route').invoke(['home', '/'], {cwd: projectDirectory, root: true});
    Maka.findGenerator('template').invoke(['home'], {cwd: projectDirectory, root: true});

    if (!_.has(opts, 'skip-flow-router')) {
      // install the flow router package
      // kadira:flow-router
      // kadira:blaze-layout
      self.installMeteorPackage('kadira:flow-router kadira:blaze-layout', {cwd: appDirectory});
    }

    if (!_.has(opts, 'skip-jasmine')) {
      // install the jasmine driver package and html/console reporter
      self.installMeteorPackage('sanjo:jasmine velocity:html-reporter velocity:console-reporter', {cwd: appDirectory});
    }

    if (!_.has(opts, 'skip-restivus')) {
      // install the RESTful api package, restivus
      self.installMeteorPackage('nimble:restivus', {cwd: appDirectory});
    }

    if (!_.has(opts, 'skip-validated-methods')) {
      // install the RESTful api package, restivus
      self.installMeteorPackage('mdg:validated-method', {cwd: appDirectory});
    }

    if (config.template.css) {
      if (config.engines.css == 'scss')
        self.installMeteorPackage('fourseven:scss', {cwd: appDirectory});

      if (config.engines.css == 'less')
        self.installMeteorPackage('less', {cwd: appDirectory});
    }

    if (config.template.js) {
      if (config.engines.js == 'coffee')
        self.installMeteorPackage('coffeescript', {cwd: appDirectory});
    }

    if (config.template.html) {
      if (config.engines.html === 'jade')
        self.installMeteorPackage('mquandalle:jade', {cwd: appDirectory});
    }

    if (opts.orbit) {
      // copy the orbit directory
      self.copyTemplateDirectory('orbit', orbitDirectory, context);
      // install rainhaven:orbit
      self.installMeteorPackage('scottmcpherson:orbit', {cwd: appDirectory});
    }

    if ('js' in opts && opts['js'].toLowerCase() === 'es6') {
      // install the Babel package for Meteor.
      self.installMeteorPackage('grigio:babel', {cwd: appDirectory});
    }

    return true;
  });
});
