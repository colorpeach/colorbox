module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      {pattern: 'test/**test.js', included: false},
      {pattern: 'components/**/**.js', included: false},
      {pattern: 'js/**.js', included: false},
      {pattern: 'lib/angular/**/**.js', included: false},
      {pattern: 'pages/**/**.js', included: false},
      
      'test/bootstrap.js'
    ],

    exclude: [
      'js/bootstrap.js'
    ],

    autoWatch : false,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'requirejs'],

    browsers : ['Chrome'],

    plugins : [
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-junit-reporter',
      'karma-requirejs'
    ],
    
    reporters: ['progress', 'junit'],

    junitReporter : {
      outputFile: 'test/unit.xml',
      suite: 'unit'
    },


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true

  });
};