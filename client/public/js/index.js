angular.module('index',['ngAnimate', 'ngRoute', 'login', 'myApps', 'addApp', 'appList'])

.config(['$routeProvider',
    function($routeProvider){
        $routeProvider
        .when('/app-list', {
            controller: 'appListCtrl',
            templateUrl: 'app-list.html'
        })
        .when('/login', {
            controller: 'loginCtrl',
            templateUrl: 'login.html'
        })
        .when('/register', {
            controller: 'registerCtrl',
            templateUrl: 'register.html'
        })
        .when('/add/:id', {
            controller: 'addAppCtrl',
            templateUrl: 'add-app.html'
        })
        .when('/add-dialog', {
            controller: 'myAppsCtrl',
            templateUrl: 'dialog.html'
        })
        .when('/my-apps', {
            controller: 'myAppsCtrl',
            templateUrl: 'my-apps.html'
        })
        .otherwise({
            redirectTo: '/'
        });
    }
])

angular.bootstrap(document, ['index']);