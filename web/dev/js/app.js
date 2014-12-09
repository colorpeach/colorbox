define(['angular-route', 'angular-animate', 'js/common'], function(){
    var app = angular.module('index', ['ngRoute', 'ngAnimate', 'common']);
    var login = false;

    var config = {
        defaultRoutePath: '/',
        routes: {
            '/': {
                full: true,
                title: '桌面',
                icon: 'icon-home',
                templateUrl: '/index.html',
                controller: 'desktopCtrl',
                dependencies: [
                    'pages/index/index', 
                    'pages/dashboard/dashboard-apps'
                ]
            },
            '/log':{
                title: '网站更新日志',
                templateUrl: 'log.html',
                controller: 'logsCtrl',
                dependencies: ['pages/log/log']
            },
            '/login': {
                title: '登录',
                icon: 'icon-enter',
                auth: 'no',
                templateUrl: 'login.html',
                controller: 'loginCtrl',
                dependencies: ['pages/login/login']
            },
            '/register': {
                title: '注册',
                icon: 'icon-signup',
                auth: 'no',
                templateUrl: 'login-register.html',
                controller: 'registerCtrl',
                dependencies: ['pages/login/login']
            },
            '/dashboard/apps': {
                title: '我的应用',
                icon: 'icon-stack',
                auth: 'yes',
                templateUrl: 'dashboard-apps.html',
                controller: 'myAppsCtrl',
                dependencies: [
                    'pages/dashboard/dashboard-apps'
                ]
            },
            '/dashboard/appPros': {
                title: '我的应用',
                icon: 'icon-windows8',
                auth: 'yes',
                templateUrl: 'dashboard-app-pro.html',
                controller: 'myAppProsCtrl',
                dependencies: [
                    'pages/dashboard/dashboard-app-pro'
                ]
            },
            '/dashboard/snippets': {
                title: '我的代码',
                icon: 'icon-code',
                auth: 'yes',
                templateUrl: 'dashboard-snippets.html',
                controller: 'mySnippetsCtrl',
                dependencies: [ 
                    'pages/dashboard/dashboard-snippets'
                ]
            },
            '/dashboard/account': {
                title: '我的信息',
                icon: 'icon-user',
                auth: 'yes',
                templateUrl: 'dashboard-account.html',
                dependencies: [
                ]
            },
            '/message': {
                title: '留言板',
                icon: 'icon-info',
                templateUrl: 'message.html',
                controller: 'messageCtrl',
                dependencies: ['pages/message/message']
            },
            '/app-square': {
                title: '所有应用',
                templateUrl: 'app-square.html',
                controller: 'appSquareCtrl',
                dependencies: [
                    'pages/app/app-square', 
                    'pages/dashboard/dashboard-apps'
                ]
            },
            '/snippet-square': {
                title: '代码广场',
                icon: 'icon-code',
                templateUrl: 'snippet-square.html',
                controller: 'snippetSquareCtrl',
                dependencies: [
                    'pages/snippet/snippet-square', 
                    'pages/dashboard/dashboard-snippets'
                ]
            },
            '/edit/app/:id': {
                full: true,
                title: '编辑应用',
                auth: 'yes',
                templateUrl: 'app-edit.html',
                controller: 'editAppCtrl',
                dependencies: [
                    'pages/app/app-edit', 
                    'pages/dashboard/dashboard-apps', 
                    'components/resize-box/resize-box'
                ]
            },
            '/edit/app-pro/:id': {
                full: true,
                title: '编辑应用',
                auth: 'yes',
                templateUrl: 'app-edit-pro.html',
                controller: 'editAppProCtrl',
                dependencies: [
                    'pages/app/app-edit-pro', 
                    'pages/dashboard/dashboard-app-pro', 
                    'components/resize-box/resize-box', 
                    'components/tree/tree',
                    'components/editor-nav/editor-nav',
                    'components/context-menu/context-menu'
                ]
            },
            '/edit/snippet/:id': {
                full: true,
                title: '编辑代码片段',
                auth: 'yes',
                templateUrl: 'snippet-edit.html',
                controller: 'editSnippetCtrl',
                dependencies: [
                    'pages/snippet/snippet-edit', 
                    'pages/dashboard/dashboard-snippets', 
                    'components/resize-box/resize-box', 
                    'components/dialog/dialog'
                ]
            },
            '/snippet/detail/:id': {
                title: '代码片段',
                templateUrl: 'snippet-detail.html',
                controller: 'snippetDetailCtrl',
                dependencies: [
                    'pages/snippet/snippet-detail', 
                    'pages/dashboard/dashboard-snippets'
                ]
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
                            if(route.path === 'no' && login){
                                return '/';
                            }else if(route.auth === 'yes' && !login){
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
                        '$q','$rootScope', '$window', '$location',
                        function($q,   $rootScope,   $window,   $location){
                            var deferred = $q.defer();

                            require(route.dependencies, function(){

                                $rootScope.title = route.title;
                                $rootScope.href = $location.path();
                                $rootScope.full = !!route.full;
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
    ['$rootScope', '$sce', '$http', '$location',
        function($rootScope,   $sce,   $http,   $location){
            $rootScope.user = angular.user;
            delete angular.user;
            $rootScope.navs = config.routes;

            $rootScope.$watch('user.login', function(val){
                login = !!val;
                $rootScope.avator = $sce.trustAsResourceUrl( 'http://identicon.relucks.org/' + val + '?size=36');
            });

            $rootScope.logout = function(e){
                e.preventDefault();
                $http.get('/_logout')
                .then(function(){
                    $rootScope.user = null;
                    $location.path('/');
                });
            };
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

    app.controller('indexCtrl',
    ['$scope',
        function($scope){
            $scope.showAside = false;

            $scope.toggleAside = function(){
                $scope.showAside = !$scope.showAside;
            };
            
            $scope.$on('$routeChangeSuccess', function(){
                $scope.showAside = false;
            });
        }
    ]);

    app
    .filter('desktopNavs', 
    [
        function(){
            var showTabs = ['/dashboard/account'];
            return function(navs){
                var r = {};
                angular.forEach(navs, function(n, i){
                    if(showTabs.indexOf(i) > -1){
                        r[i] = n;
                    }
                });
                return r;
            }
        }
    ])

    .filter('desktopTabs', 
    [
        function(){
            var showTabs = ['/', '/snippet-square'];
            return function(navs){
                var r = {};
                angular.forEach(navs, function(n, i){
                    if(showTabs.indexOf(i) > -1){
                        r[i] = n;
                    }
                });
                return r;
            }
        }
    ])

    .filter('assistItems', 
    [
        function(){
            var showTabs = ['/', '/snippet-square', '/dashboard/account'];
            return function(navs){
                var r = {};
                angular.forEach(navs, function(n, i){
                    if(showTabs.indexOf(i) > -1){
                        r[i] = n;
                    }
                });
                return r;
            }
        }
    ])

    return app;
});