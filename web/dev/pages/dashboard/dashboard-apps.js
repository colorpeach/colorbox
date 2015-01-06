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
                    return $http.post('/add/app', data);
                },
                del: function(id){
                    return $http.post('/del/app', {_id: id});
                },
                save: function(data){
                    return $http.post('/save/app', data);
                },
                getUserApps: function(){
                    return $http.get('/get/apps', {cache: true});
                },
                getPublishedApps: function(data){
                    return $http.get('/_get/published/apps', {params: data});
                }
            };
        }
    ])

    .controller('myAppsCtrl',
    ['$scope', 'appsCrud', 'prompt',
        function($scope,   appsCrud, prompt){
            $scope.currentSize = {};
            $scope.current = {};
            $scope.sizeOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
            $scope.showOptions = {
                false: '显示logo',
                true: '显示页面'
            };
            $scope.status = {
                addSize: false,
                page: 'list'
            };
            $scope.appTypeList = [
                {name: '工具', key: 'tool'},
                {name: '游戏', key: 'game'},
                {name: '控件', key: 'code'},
                {name: '库', key: 'library'}
            ];

            $scope.setLoad({
                loading: true,
                loadMessage: '载入应用列表...'
            });

            appsCrud.getUserApps()
            .success(function(data){
                $scope.apps = data.apps;
            });

            $scope.switch = function(e, page, app, $index){
                $scope.status.page = page;
                switch(page){
                    case 'add':
                        $scope.data = {};
                        $scope.errorMsg = [];
                    break;
                    case 'detail':
                        e.preventDefault();
                        $scope.current = app;
                        $scope.current.$index = $index;
                    break;
                    default:
                        $scope.current = {};
                        $scope.currentSize = {};
                }
            };

            $scope.add = function(){
                $scope.data.sizes = [{x: 1, y: 1}];
                appsCrud.add($scope.data)
                .success(function(data){
                    $scope.apps.push(data.app);
                    prompt({
                        content: '添加应用成功'
                    });
                    $scope.switch(null, 'list');
                })
                .error(function(data){
                    if(data.error){
                        $scope.errorMsgs = data.errorMsg;
                    }
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
                    prompt({
                        content: '删除成功'
                    });
                    $scope.switch(null, 'list');
                });
            };

            $scope.switchAddSize = function(){
                if($scope.status.addSize = !$scope.status.addSize){
                    $scope.currentSize = {x: 1, y: 1, showIframe: false};
                }
            };

            $scope.addSize = function(){
                $scope.current.sizes.push($scope.currentSize);
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
    ])
});