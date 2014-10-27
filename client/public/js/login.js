angular.module('login',['utils'])

.run(['$templateCache', 'utils',
    function($templateCache,   utils){
        $templateCache.put('login.html', utils.heredoc(function(){/*!
            <form action="/login" method="post">
                <div class="row">
                    <div class="large-12 columns">
                        <label for="username">用户名</label>
                        <input id="username" type="text" name="username">
                    </div>
                </div>
                <div class="row">
                    <div class="large-12 columns">
                        <label for="password">密码</label>
                        <input id="password" type="password" name="password">
                    </div>
                </div>
                <div class="row">
                    <div class="large-12 columns">
                        <input type="submit" class="button expand" value="登录">
                    </div>
                </div>
            </form>
        */}));
    }
])

.controller('loginCtrl', 
['$scope',
    function($scope){

    }
]);