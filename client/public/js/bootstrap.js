require.config({
    baseUrl: '/lib/codemirror/4.7/addon/mode',
    paths: {
        'angular'                 : '/lib/angular/1.3.0/angular.min',
        'angular-route'           : '/lib/angular/1.3.0/angular-route.min',
        'angular-animate'         : '/lib/angular/1.3.0/angular-animate.min',
        'codemirror'              : '/lib/codemirror/4.7/lib/codemirror',
        'loadmode'                : '/lib/codemirror/4.7/addon/mode/loadmode',
        'meta'                    : '/lib/codemirror/4.7/mode/meta',
        'add-app'                 : '/public/js/add-app'
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
        'codemirror': {
            exports: '../../lib/codemirror'
        }
    },
    packages: [
        {
            name: 'js',
            location: '/public/js'
        }
    ]
});

require(['js/app'], function(app){
    angular.bootstrap(document, [app.name]);
});