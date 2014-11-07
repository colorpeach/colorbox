define(['angular-route', 'angular-animate', 'js/common'], function(){
    var app = angular.module('index', ['ngRoute', 'ngAnimate', 'common']);
    var config = {
        defaultRoutePath: '/',
        routes: {
            '/': {
                templateUrl: 'index.html',
                dependencies: ['js/index', 'js/app-list']
            },
            '/login': {
                templateUrl: 'login.html',
                controller: 'loginCtrl',
                dependencies: ['js/login']
            },
            '/register': {
                templateUrl: 'register.html',
                controller: 'registerCtrl',
                dependencies: ['js/login']
            },
            '/app-list': {
                templateUrl: 'app-list.html',
                controller: 'appListCtrl',
                dependencies: ['js/app-list']
            },
            '/my-apps': {
                templateUrl: 'my-apps.html',
                controller: 'myAppsCtrl',
                dependencies: ['js/my-apps']
            },
            '/message-board': {
                templateUrl: 'message.html',
                controller: 'messageCtrl',
                dependencies: ['js/message']
            },
            '/add/:id': {
                templateUrl: 'add-app.html',
                controller: 'addAppCtrl',
                dependencies: ['add-app']
            },
            '/add-dialog': {
                templateUrl: 'add-dialog.html',
                controller: 'myAppsCtrl',
                dependencies: ['js/my-apps']
            }
        }
    };

    app.config(
    [
        '$routeProvider',
        '$locationProvider',
        '$controllerProvider',
        '$compileProvider',
        '$filterProvider',
        '$provide',

        function($routeProvider, $locationProvider, $controllerProvider, $compileProvider, $filterProvider, $provide){
            app.controller = bind($controllerProvider, 'register', app);
            app.directive  = bind($compileProvider, 'directive', app);
            app.filter     = bind($filterProvider, 'register', app);
            app.factory    = bind($provide, 'factory', app);
            app.service    = bind($provide, 'service' ,app);

//             $locationProvider.html5Mode(true);

            if(config.routes !== undefined){
                angular.forEach(config.routes, function(route, path){
                    $routeProvider.when(path, {templateUrl:route.templateUrl, resolve:dependencyResolverFor(route.dependencies), controller: route.controller});
                });
            }

            if(config.defaultRoutePaths !== undefined){
                $routeProvider.otherwise({redirectTo:config.defaultRoutePaths});
            }

            function bind(context, name, r){
                return function(){
                    context[name].apply(context, arguments);
                    return r;
                }
            }

            function dependencyResolverFor(dependencies){
                var definition = {
                    resolver: ['$q','$rootScope', function($q, $rootScope){
                        var deferred = $q.defer();

                        require(dependencies, function(){
                            $rootScope.$apply(function(){
                                deferred.resolve();
                            });
                        });

                        return deferred.promise;
                    }]
                }

                return definition;
            }
        }
    ]);

    app.run(
    ['$rootScope',
        function($rootScope){
            $rootScope.$on('$routeChangeStart', function(){
                $rootScope.loading = true;
            });
            $rootScope.$on('$routeChangeSuccess', function(){
                $rootScope.loading = false;
            });
        }
    ]);

    return app;
});