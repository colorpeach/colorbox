define(['js/app'], function(app){
    app
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
            $scope.currentSize = {};
            $scope.current = {};
            $scope.sizeOptions = {
                false: '显示logo',
                true: '显示页面'
            };
            $scope.status = {
                addSize: false
            };

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
                    $scope.currentSize = {};
                });
            };

            $scope.chooseApp = function(app, $index){
                $scope.current = app;
                $scope.current.$index = $index;
                $scope.currentSize = {};
                !$scope.current.sizes && ($scope.current.sizes = []);
                !$scope.current.sizes.length && ($scope.current.sizes.push({x: '1', y: '1', showIframe: 'false'}));
            };

            $scope.addSize = function(){
                $scope.current.sizes.push($scope.currentSize);
                $scope.currentSize = {};
                $scope.status.addSize = false;
            };

            $scope.delSize = function(i){
                $scope.current.sizes.splice(i, 1);
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
    ]);
});