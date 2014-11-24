define(['angular-route', 'angular-animate', 'js/common'], function(){
    var app = angular.module('index', ['ngRoute', 'ngAnimate', 'common']);
    var pathsMap = {
        noAuthPaths: ['/login', '/register'],
        authPaths: ['/dashboard/:tab', '/edit/app/:id', '/edit/snippet/:id'],
        login: false
    };

    var config = {
        defaultRoutePath: '/',
        routes: {
            '/': {
                title: '桌面',
                templateUrl: '/index.html',
                controller: 'desktopCtrl',
                dependencies: ['pages/index/index', 'pages/dashboard/dashboard-apps']
            },
            '/log':{
                title: '网站更新日志',
                templateUrl: 'log.html',
                controller: 'logsCtrl',
                dependencies: ['pages/log/log']
            },
            '/login': {
                title: '登录',
                templateUrl: 'login.html',
                controller: 'loginCtrl',
                dependencies: ['pages/login/login']
            },
            '/register': {
                title: '注册',
                templateUrl: 'login-register.html',
                controller: 'registerCtrl',
                dependencies: ['pages/login/login']
            },
            '/app-square': {
                title: '所有应用',
                templateUrl: 'app-square.html',
                controller: 'appSquareCtrl',
                dependencies: ['pages/app/app-square', 'pages/dashboard/dashboard-apps']
            },
            '/snippet-square': {
                title: '代码广场',
                templateUrl: 'snippet-square.html',
                controller: 'snippetSquareCtrl',
                dependencies: ['pages/snippet/snippet-square', 'pages/dashboard/dashboard-snippets']
            },
            '/dashboard/:tab': {
                title: '我的仪表盘',
                templateUrl: 'dashboard.html',
                controller: 'dashboardCtrl',
                dependencies: ['pages/dashboard/dashboard', 'pages/dashboard/dashboard-apps', 'pages/dashboard/dashboard-snippets']
            },
            '/message': {
                title: '留言板',
                templateUrl: 'message.html',
                controller: 'messageCtrl',
                dependencies: ['pages/message/message']
            },
            '/edit/app/:id': {
                title: '编辑应用',
                templateUrl: 'app-edit.html',
                controller: 'editAppCtrl',
                dependencies: ['pages/app/app-edit', 'pages/dashboard/dashboard-apps', 'components/resize-box/resize-box']
            },
            '/edit/app-pro': {
                title: '编辑应用',
                templateUrl: 'app-edit-pro.html',
                controller: 'editAppProCtrl',
                dependencies: [
                    'pages/app/app-edit-pro', 
                    'pages/dashboard/dashboard-apps', 
                    'components/resize-box/resize-box', 
                    'components/tree/tree',
                    'components/editor-nav/editor-nav',
                    'components/editor-tab/editor-tab'
                ]
            },
            '/edit/snippet/:id': {
                title: '编辑代码片段',
                templateUrl: 'snippet-edit.html',
                controller: 'editSnippetCtrl',
                dependencies: ['pages/snippet/snippet-edit', 'pages/dashboard/dashboard-snippets', 'components/resize-box/resize-box', 'components/dialog/dialog']
            },
            '/snippet/detail/:id': {
                title: '代码片段',
                templateUrl: 'snippet-detail.html',
                controller: 'snippetDetailCtrl',
                dependencies: ['pages/snippet/snippet-detail', 'pages/dashboard/dashboard-snippets']
            }
        }
    };

    app.run(
    ['$rootScope', '$sce', '$http', '$location',
        function($rootScope,   $sce,   $http,   $location){
            $rootScope.user = angular.user;
            delete angular.user;
            $rootScope.$watch('user.login', function(val){
                pathsMap.login = !!val;
                $rootScope.avator = $sce.trustAsResourceUrl( 'http://identicon.relucks.org/' + val + '?size=36');
            });

            $rootScope.logout = function(e){
                e.preventDefault();
                $http.get('/_logout')
                .then(function(){
                    $rootScope.user = null;
                    $location.path('/');
                });
            }
        }
    ]);

    app.config(
    [
        '$routeProvider',
        '$locationProvider',
        '$controllerProvider',
        '$compileProvider',
        '$filterProvider',
        '$provide',
        '$rootScopeProvider',

        function($routeProvider, $locationProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $rootScopeProvider){
            app.controller = bind($controllerProvider, 'register', app);
            app.directive  = bind($compileProvider, 'directive', app);
            app.filter     = bind($filterProvider, 'register', app);
            app.factory    = bind($provide, 'factory', app);
            app.service    = bind($provide, 'service' ,app);
            app.value    = bind($provide, 'value' ,app);

//             $locationProvider.html5Mode(true);

            if(config.routes !== undefined){
                angular.forEach(config.routes, function(route, path){
                    $routeProvider.when(path, {
                        templateUrl: route.templateUrl, 
                        resolve: dependencyResolverFor(route, path), 
                        controller: route.controller, 
                        title: route.title,
                        redirectTo: function(){
                            //如果用户已经登录，无法再看到登录和注册页面
                            if(pathsMap.noAuthPaths.indexOf(path) > -1 && pathsMap.login){
                                return '/';
                            }else if(pathsMap.authPaths.indexOf(path) > -1 && !pathsMap.login){
                                return '/login';
                            }
                        }
                    });
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

            function dependencyResolverFor(route, path){
                var definition = {
                    resolver: [
                        '$q','$rootScope', '$window',
                        function($q,   $rootScope,   $window){
                            var deferred = $q.defer();

                            require(route.dependencies, function(){

                                $rootScope.title = route.title;
                                $window.document.title = 'colorBox-' + route.title;

                                $rootScope.$apply(function(){
                                    deferred.resolve();
                                });
                            }, function(){
                                deferred.reject();
                            });

                            return deferred.promise;
                        }
                    ]
                }

                return definition;
            }
        }
    ]);

    app.run(
    ['$rootScope', '$window',
        function($rootScope, $window){
            $rootScope.$on('$routeChangeStart', function(e, route){
                $rootScope.loadMessage = '载入页面...';
                $rootScope.loading = true;
            });
            $rootScope.$on('$routeChangeSuccess', function(){
                $rootScope.loading = false;
                $rootScope.loadMessage = '';
            });
            $rootScope.$on('$routeChangeError', function(){
                $rootScope.loadMessage = '加载失败, 请刷新页面';
                $rootScope.loading = false;
            });

            $rootScope.reload = location.reload;
            $rootScope.setLoad = function(o){
                angular.isDefined(o.loading) && ($rootScope.loading = o.loading);
                angular.isDefined($rootScope.loadMessage) && ($rootScope.loadMessage = o.loadMessage);
            };
            $rootScope.removeLoad = function(){
                $rootScope.loading = '';
                $rootScope.loadMessage = '';
            };
        }
    ]);

    return app;
});