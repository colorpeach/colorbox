require.config({
    baseUrl: '/',
    waitSeconds: 60,
    paths: {
        'angular'                 : '/lib/angular/1.3.0/angular.min',
        'angular-route'           : '/lib/angular/1.3.0/angular-route.min',
        'angular-animate'         : '/lib/angular/1.3.0/angular-animate.min',
        'html2canvas'             : '/lib/html2canvas/0.4.1/html2canvas.min',
        'markdown'                : '/lib/markdown/0.6.0/markdown',
        'showdown'                : '/lib/showdown/showdown'
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
        'markdown': {
            exports: 'markdown'
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
        }
    ]
});

require(['js/app', 'js/config'], function(app){
    angular.bootstrap(document, [app.name]);
});