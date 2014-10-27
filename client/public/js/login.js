angular.module('login', ['common'])

.factory('loginBox',
['$http',
    function($http){
        return {
            enter: function(data){
                return $http.post('/login', data);
            },
            register: function(data){
                return $http.post('/register', data);
            }
        };
    }
])

.controller('loginCtrl', 
['$scope', 'loginBox',
    function($scope,   loginBox){
        $scope.errorMsgs = [];
        //提交表单
        $scope.submit = function(e){
            e.preventDefault();
            loginBox.enter($scope.data)
            .success(function(data){
                location.href = '/';
            })
            .error(function(data){
                $scope.errorMsgs = data.errorMsg || [];
            });
        };
    }
])

.controller('registerCtrl', 
['$scope', 'loginBox',
    function($scope,   loginBox){
        $scope.errorMsgs = [];
        //提交表单
        $scope.submit = function(e){
            e.preventDefault();
            loginBox.register($scope.data)
            .success(function(data){
                location.href = '/';
            })
            .error(function(data){
                $scope.errorMsgs = data.errorMsg || [];
            });
        };
    }
]);