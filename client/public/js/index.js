angular.module('index',['ngRoute', 'login'])

.config(['$routeProvider',
    function($routeProvider){
        $routeProvider
        .when('/login', {
            controller: 'loginCtrl',
            templateUrl: 'login.html'
        })
        .when('/register', {
            controller: 'registerCtrl',
            templateUrl: 'register.html'
        })
        .otherwise({
            redirectTo: '/'
        });
    }
])

angular.bootstrap(document, ['index']);