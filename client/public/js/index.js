angular.module('index',['ngRoute', 'login'])

.config(['$routeProvider',
    function($routeProvider){
        $routeProvider
        .when('/login', {
            controller: 'loginCtrl',
            templateUrl: 'login.html'
        })
        .otherwise({
            redirectTo: '/'
        });
    }
])

angular.bootstrap(document, ['index']);