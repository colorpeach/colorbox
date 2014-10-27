angular.module('login', ['ngAnimate', 'common'])

.run(['$templateCache', 'utils',
    function($templateCache,   utils){
        $templateCache.put('login.html', utils.heredoc(function(){/*!
            <form name="loginForm" action="/login" method="post" ng-submit="submit($event)" ng-animate="view">
                <div class="row small-4">
                    <fieldset>
                        <legend> 登录 </legend>
                        <div ng-repeat="error in errorMsgs" class="alert-box alert">{{error}}</div>
                        <div class="large-12 columns">
                            <label for="username">用户名</label>
                            <input id="username" type="text" name="username" ng-model="data.username">
                        </div>
                        <div class="large-12 columns">
                            <label for="password">密码</label>
                            <input id="password" type="password" name="password" ng-model="data.password">
                        </div>
                        <div class="large-12 columns">
                            <input type="submit" class="button expand" value="登录">
                        </div>
                    </fieldset>
                </div>
            </form>
        */}));

        $templateCache.put('register.html', utils.heredoc(function(){/*!
            <form name="registerForm" action="/register" method="post" ng-submit="submit($event)">
                <div class="row small-4">
                    <fieldset>
                        <legend> 注册 </legend>
                        <div ng-repeat="error in errorMsgs" class="alert-box alert">{{error}}</div>
                        <div class="large-12 columns">
                            <label for="username">用户名</label>
                            <input id="username" type="text" name="username" ng-model="data.username">
                        </div>
                        <div class="large-12 columns">
                            <label for="password">密码</label>
                            <input id="password" type="password" name="password" ng-model="data.password">
                        </div>
                        <div class="large-12 columns">
                            <label for="confirm-password">确认密码</label>
                            <input id="confirm-password" type="password" name="confirmPassword">
                        </div>
                        <div class="large-12 columns">
                            <input type="submit" class="button expand" value="登录">
                        </div>
                    </fieldset>
                </div>
            </form>
        */}));
    }
])

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