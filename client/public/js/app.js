define(['angular-route', 'angular-animate', 'js/common'], function(){
    var app = angular.module('index', ['ngRoute', 'ngAnimate', 'common']);
    var config = {
        defaultRoutePath: '/',
        routes: {
            '/': {
                title: 'colorBox-桌面',
                templateUrl: 'index.html',
                controller: 'desktopCtrl',
                dependencies: ['js/index', 'js/app-list']
            },
            '/login': {
                title: '登录colorBox',
                templateUrl: 'login.html',
                controller: 'loginCtrl',
                dependencies: ['js/login']
            },
            '/register': {
                title: '注册colorBox账号',
                templateUrl: 'register.html',
                controller: 'registerCtrl',
                dependencies: ['js/login']
            },
            '/app-list': {
                title: 'colorBox-所有应用',
                templateUrl: 'app-list.html',
                controller: 'appListCtrl',
                dependencies: ['js/app-list']
            },
            '/dashboard/:tab': {
                title: 'colorBox-我的仪表盘',
                templateUrl: 'dashboard.html',
                controller: 'dashboardCtrl',
                dependencies: ['js/dashboard']
            },
            '/message-board': {
                title: 'colorBox-留言板',
                templateUrl: 'message.html',
                controller: 'messageCtrl',
                dependencies: ['js/message']
            },
            '/add/:id': {
                title: 'colorBox-应用编辑',
                templateUrl: 'add-app.html',
                controller: 'addAppCtrl',
                dependencies: ['js/add-app']
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
                    $routeProvider.when(path, {templateUrl:route.templateUrl, resolve:dependencyResolverFor(route.dependencies), controller: route.controller, title: route.title});
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
    ['$rootScope', '$window',
        function($rootScope, $window){
            $rootScope.$on('$routeChangeStart', function(e, route){
                $rootScope.loadMessage = '';
                $rootScope.loading = true;
                $window.document.title = route.$$route.title;
            });
            $rootScope.$on('$routeChangeSuccess', function(){
                $rootScope.loading = false;
            });
            $rootScope.$on('$routeChangeError', function(){
                $rootScope.loadMessage = '加载失败, 点击重新载入';
                $rootScope.loading = false;
            });

            $rootScope.reload = location.reload;
            $rootScope.setLoad = function(o){
                angular.isDefined(o.loading) && ($rootScope.loading = o.loading);
                angular.isDefined($rootScope.loadMessage) && ($rootScope.loadMessage = o.loadMessage);
            };
        }
    ]);

    return app;
});