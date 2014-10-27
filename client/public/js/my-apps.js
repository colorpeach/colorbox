angular.module('myApps', [])

.run(['$templateCache', 'utils',
    function($templateCache,   utils){
        $templateCache.put('dialog.html', utils.heredoc(function(){/*!
            <div class="reveal-modal-bg" style="display:block"></div>
            <div class="reveal-modal" style="display:block;visibility:visible">
                <a class="close-reveal-modal" ng-click="back()">&#215;</a>
                <fieldset>
                    <legend> 添加应用 </legend>
                    <div class="large-12 columns">
                        <label for="name">应用名称</label>
                        <input id="name" type="text" name="name" ng-model="data.name">
                    </div>
                    <div class="large-12 columns">
                        <input type="button" class="button" value="添加" ng-click="add()">
                        <input type="button" class="button secondary" value="取消" ng-click="back()">
                    </div>
                </fieldset>
            </div>
        */}));
    }
])

.factory('appsCrud', 
['$http',
    function($http){
        return {
            add: function(data){
                return $http.post('/post/add/app', data);
            },
            getApps: function(){
                return $http.get('/get/apps');
            }
        };
    }
])

.controller('myAppsCtrl', 
['$scope', 'appsCrud', '$location',
    function($scope,   appsCrud,   $location){
        $scope.apps = [];
        appsCrud.getApps()
        .success(function(data){
            $scope.apps = data.apps;
        });
        
        $scope.back = function(){
            history.back();
        };
        
        $scope.add = function(){
            appsCrud.add($scope.data)
            .success(function(){
                $location.url('my-apps');
            });
        };
    }
])