define(['angular-route', 'angular-animate', 'js/common'], function(){
    var app = angular.module('index', ['ngRoute', 'ngAnimate', 'common']);
    var login = false;

    var config = {
        defaultRoutePath: '/',
        routes: {
            '/': {
                title: '桌面',
                icon: 'icon-home',
                user: true,
                templateUrl: '/index.html',
                controller: 'desktopCtrl',
                dependencies: [
                    'pages/index/index', 
                    'pages/app/app-square'
                ]
            },
            '/log':{
                title: '网站更新日志',
                icon: 'icon-file',
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
            '/dashboard/articles': {
                title: '我的文档',
                icon: 'icon-file',
                auth: 'yes',
                templateUrl: 'dashboard-articles.html',
                controller: 'myArticlesCtrl',
                dependencies: [
                    'pages/dashboard/dashboard-articles'
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
                    'pages/app/app-square'
                ]
            },
            '/snippet-square': {
                title: '代码广场',
                icon: 'icon-code',
                user: true,
                templateUrl: 'snippet-square.html',
                controller: 'snippetSquareCtrl',
                dependencies: [
                    'pages/snippet/snippet-square'
                ]
            },
            '/edit/article/:id': {
                title: '编辑文档',
                auth: 'yes',
                templateUrl: 'article-edit.html',
                controller: 'editArticleCtrl',
                dependencies: [
                    'pages/article/article-edit', 
                    'components/resize-box/resize-box'
                ]
            },
            '/edit/app-pro/:id': {
                title: '编辑应用',
                auth: 'yes',
                templateUrl: 'app-edit-pro.html',
                controller: 'editAppProCtrl',
                dependencies: [
                    'pages/app/app-edit-pro',
                    'components/resize-box/resize-box',
                    'components/tree/tree',
                    'components/editor-nav/editor-nav',
                    'components/context-menu/context-menu'
                ]
            },
            '/edit/snippet/:id': {
                title: '编辑代码片段',
                auth: 'yes',
                templateUrl: 'snippet-edit.html',
                controller: 'editSnippetCtrl',
                dependencies: [
                    'pages/snippet/snippet-edit',
                    'components/resize-box/resize-box',
                    'components/dialog/dialog'
                ]
            },
            '/snippet/detail/:id': {
                title: '代码片段',
                templateUrl: 'snippet-detail.html',
                controller: 'snippetDetailCtrl',
                dependencies: [
                    'pages/snippet/snippet-detail'
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
            app.value      = bind($provide, 'value' ,app);

//             $locationProvider.html5Mode(true);

            if(config.routes !== undefined){
                angular.forEach(config.routes, function(route, path){
                    $routeProvider.when(path, {
                        templateUrl: route.templateUrl, 
                        resolve: dependencyResolverFor(route), 
                        controller: route.controller, 
                        title: route.title,
                        redirectTo: function(){
                            //如果用户已经登录，无法再看到登录和注册页面
                            if(route.auth === 'no' && login){
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

            function dependencyResolverFor(route){
                var definition = {
                    resolver: [
                        '$q','$rootScope', '$window', '$location',
                        function($q,   $rootScope,   $window,   $location){
                            var deferred = $q.defer();

                            require(route.dependencies, function(){

                                $rootScope.title = route.title;
                                $rootScope.href = $location.path();
                                $rootScope.showUser = route.user;
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
    ['$rootScope', '$sce', '$http', '$location', '$timeout',
        function($rootScope,   $sce,   $http,   $location,   $timeout){
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

            $rootScope.logined = function(){
                return !!$rootScope.user;
            };

            $timeout(function(){
                $rootScope.hideLogoLoading = true;
            }, 2000);
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

    app
    .filter('dashboardNavs', 
    [
        function(){
            var showTabs = ['/dashboard/snippets', '/dashboard/appPros', '/dashboard/articles'];
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

    .filter('logoNavs', 
    [
        function(){
            var showTabs = ['/log', '/snippet-square', '/message', '/'];
            return function(navs){
                var r = [];
                angular.forEach(navs, function(n, i){
                    if(showTabs.indexOf(i) > -1){
                        n.href = i;
                        r.push(n);
                    }
                });

                r.sort(function(a, b){
                    return showTabs.indexOf(a.href) - showTabs.indexOf(b.href);
                });

                return r;
            }
        }
    ])

    .filter('assistItems', 
    [
        function(){
            var showTabs = ['/dashboard/appPros', '/dashboard/snippets', '/dashboard/articles'];
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

    .directive('drag',
    ['$window', '$timeout',
        function($window, $timeout){
            var eventsMap = {
                web: {
                    down: 'mousedown',
                    up: 'mouseup',
                    move: 'mousemove'
                },
                mobile: {
                    down: 'touchstart',
                    up: 'touchend',
                    move: 'touchmove'
                }
            };
            var device;
            var $body = angular.element($window.document.body);

            if($window.document.hasOwnProperty("ontouchstart")){
                device = 'mobile';
            }else{
                device = 'web';
            }
            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    element.bind(eventsMap[device].down, startDrag);

                    function startDrag(e){
                        var rect = element[0].getBoundingClientRect();
                        var position = {};
                        var relative = {};
                        var point = {};

                        if(e.touches){
                            relative.x = e.touches[0].clientX - rect.left;
                            relative.y = e.touches[0].clientY - rect.top;
                        }else{
                            relative.x = e.clientX - rect.left;
                            relative.y = e.clientY - rect.top;
                        }

                        $body.bind(eventsMap[device].move, function(e){
                            if(e.touches){
                                e.preventDefault();
                                point = {
                                    x: e.touches[0].clientX,
                                    y: e.touches[0].clientY
                                };
                            }else{
                                point = {
                                    x: e.clientX,
                                    y: e.clientY
                                };
                            }

                            position = {
                                left: point.x - relative.x + 'px',
                                top: point.y - relative.y + 'px'
                            };
                            
                            element.css(position);
                        });

                        $body.bind(eventsMap[device].up, function(e){
                            $body.off(eventsMap[device].move);
                            $body.off(eventsMap[device].up);
                        });
                    }
                }
            };
        }
    ]);

    return app;
});