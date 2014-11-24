define(['js/app'], function(app){
    app
    .factory('loginBox',
    ['$http',
        function($http){
            return {
                enter: function(data){
                    return $http.post('/_login', data);
                },
                register: function(data){
                    return $http.post('/_register', data);
                }
            };
        }
    ])

    .controller('loginCtrl', 
    ['$scope', 'loginBox', '$rootScope', '$location',
        function($scope,   loginBox,   $rootScope,   $location){
            $scope.errorMsgs = [];
            //提交表单
            $scope.submit = function(e){
                e.preventDefault();
                loginBox.enter($scope.data)
                .success(function(data){
                    $rootScope.user = data.user;
                    $location.path('/dashboard/snippets');
                })
                .error(function(data){
                    $scope.errorMsgs = data.errorMsg || [];
                });
            };
        }
    ])

    .controller('registerCtrl', 
    ['$scope', 'loginBox', '$rootScope', '$location',
        function($scope,   loginBox,   $rootScope,   $location){
            $scope.errorMsgs = [];
            //提交表单
            $scope.submit = function(e){
                e.preventDefault();
                loginBox.register($scope.data)
                .success(function(data){
                    $rootScope.user = data.user;
                    $location.path('/dashboard/snippets');
                })
                .error(function(data){
                    $scope.errorMsgs = data.errorMsg || [];
                });
            };
        }
    ]);
});