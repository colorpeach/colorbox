define(['js/app'], function(app){
    app

    .controller('loginCtrl', 
    ['$scope', 'data::store', '$rootScope', '$location',
        function($scope,   store,   $rootScope,   $location){
            $scope.errorMsgs = [];
            //提交表单
            $scope.submit = function(e){
                e.preventDefault();

                $scope.setLoad({
                    loading: true,
                    loadMessage: '登陆中...'
                });

                store('login', 'enter', $scope.data)
                .success(function(data){
                    $rootScope.user = data.user;
                    $location.path($rootScope.backUrl || '/');
                })
                .error(function(data){
                    $scope.errorMsgs = data.errorMsg || [];
                });
            };
        }
    ])

    .controller('registerCtrl', 
    ['$scope', 'data::store', '$rootScope', '$location',
        function($scope,   store,   $rootScope,   $location){
            $scope.errorMsgs = [];
            //提交表单
            $scope.submit = function(e){
                e.preventDefault();

                $scope.setLoad({
                    loading: true,
                    loadMessage: '注册中...'
                });
                store('login', 'register', $scope.data)
                .success(function(data){
                    $rootScope.user = data.user;
                    $location.path('/');
                })
                .error(function(data){
                    $scope.errorMsgs = data.errorMsg || [];
                });
            };
        }
    ]);
});