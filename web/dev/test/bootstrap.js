var allTestFiles = [];
var TEST_REGEXP = /test\.js$/;

var pathToModule = function(path) {
    return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
    if (TEST_REGEXP.test(file)) {
        // Normalize paths to RequireJS module names.
        allTestFiles.push(pathToModule(file));
    }
});

require.config({
    baseUrl: '/base',
    waitSeconds: 60,
    paths: {
        'angular'                 : './lib/angular/1.3.0/angular',
        'angular-route'           : './lib/angular/1.3.0/angular-route',
        'angular-animate'         : './lib/angular/1.3.0/angular-animate',
        'angular-sanitize'        : './lib/angular/1.3.0/angular-sanitize',
        'angular-mocks'           : './lib/angular/1.3.0/angular-mocks',
        'html2canvas'             : './lib/html2canvas/0.4.1/html2canvas.min',
        'markdown'                : './lib/markdown/0.6.0/markdown',
        'raphael'                 : './lib/raphael/2.1.0/raphael.min',
        'sequence-diagram'        : './lib/sequence-diagram/1.0.4/sequence-diagram.min',
        'underscore'              : './lib/underscore/1.4.2/underscore.min',
        'flowchart'               : './lib/flowchart/1.3.4/flowchart.min',
        'highlight'               : './lib/highlight/highlight.pack'
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        'angular-route': {
            exports: 'angular-route',
            deps: ['angular']
        },
        'angular-animate': {
            exports: 'angular-animate',
            deps: ['angular']
        },
        'angular-sanitize': {
            exports: 'angular-sanitize',
            deps: ['angular']
        },
        'angular-mocks': {
            exports: 'angular-mocks',
            deps: ['angular']
        },
        'markdown': {
            exports: 'markdown'
        },
        'showdown/extensions/code': {
            deps: ['showdown']
        },
        'showdown/extensions/table': {
            deps: ['showdown']
        },
        'sequence-diagram': {
            exports: 'Diagram',
            deps: ['raphael', 'underscore']
        },
        'flowchart': {
            deps: ['raphael']
        }
    },
    packages: [
        {
            name: 'cm',
            location: './lib/codemirror/4.7'
        },
        {
            name: 'ace',
            location: './lib/ace'
        },
        {
            name: 'components',
            location: './components'
        },
        {
            name: 'showdown',
            location: './lib/showdown',
            main: 'showdown'
        }
    ],

    // dynamically load all test files
    deps: allTestFiles,

    // we have to kickoff jasmine, as it is asynchronous
    callback: window.__karma__.start
});