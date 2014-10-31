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
            get: function(id){
                return $http.get('/get/app?_id='+ id);
            },
            add: function(data){
                return $http.post('/post/add/app', data);
            },
            del: function(id){
                return $http.post('/post/del/app', {_id: id});
            },
            save: function(data){
                return $http.post('/post/save/app', data);
            },
            getApps: function(){
                return $http.get('/get/apps');
            }
        };
    }
])

.controller('myAppsCtrl', 
['$scope', 'appsCrud', '$location', 'prompt',
    function($scope,   appsCrud,   $location,   prompt){
        $scope.apps = [];
        $scope.current = {};

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

        $scope.del = function(){
            var sure = window.prompt('删除应用将无法撤销，确认删除请填写正确的应用名称');
            
            if(sure !== $scope.current.name){
                sure !== null && prompt({
                    content: '无法删除，应用名称填写错误',
                    type: 'warning'
                });
                return;
            }
            appsCrud.del($scope.current._id)
            .success(function(){
                $scope.apps.splice($scope.current.$index, 1);
                $scope.current = {};
            });
        };

        $scope.chooseApp = function(app, $index){
            $scope.current = app;
            $scope.current.$index = $index;
        };

        $scope.submit = function(e){
            e.preventDefault();
            appsCrud.save($scope.current)
            .success(function(){
                prompt({
                    content: '保存成功'
                });
            });
        };
    }
])