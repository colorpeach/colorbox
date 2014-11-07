require.config({
    baseUrl: '/',
    paths: {
        'angular'                 : '/lib/angular/1.3.0/angular.min',
        'angular-route'           : '/lib/angular/1.3.0/angular-route.min',
        'angular-animate'         : '/lib/angular/1.3.0/angular-animate.min',
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
        }
    },
    packages: [
        {
            name: 'js',
            location: '/public/js'
        },
        {
            name: 'cm',
            location: '/lib/codemirror/4.7'
        }
    ]
});

require(['js/app'], function(app){
    angular.bootstrap(document, [app.name]);
});