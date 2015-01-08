require.config({
    baseUrl: '/',
    waitSeconds: 60,
    paths: {
        'angular'                 : '/lib/angular/1.3.0/angular.min',
        'angular-route'           : '/lib/angular/1.3.0/angular-route.min',
        'angular-animate'         : '/lib/angular/1.3.0/angular-animate.min',
        'angular-sanitize'        : '/lib/angular/1.3.0/angular-sanitize.min',
        'html2canvas'             : '/lib/html2canvas/0.4.1/html2canvas.min',
        'markdown'                : '/lib/markdown/0.6.0/markdown',
        'raphael'                 : '/lib/raphael/2.1.0/raphael.min',
        'sequence-diagram'        : '/lib/sequence-diagram/1.0.4/sequence-diagram.min',
        'underscore'              : '/lib/underscore/1.4.2/underscore.min',
        'flowchart'               : '/lib/flowchart/1.3.4/flowchart.min'
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
            location: '/lib/codemirror/4.7'
        },
        {
            name: 'ace',
            location: '/lib/ace'
        },
        {
            name: 'components',
            location: '/components'
        },
        {
            name: 'showdown',
            location: '/lib/showdown',
            main: 'showdown'
        }
    ]
});

require(['js/app', 'js/config'], function(app){
    angular.bootstrap(document, [app.name]);
});