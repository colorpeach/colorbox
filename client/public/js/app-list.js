define(['js/app'], function(app){
    app

    .controller('appListCtrl', 
    ['$scope', 'appsCrud', '$sce', '$location',
        function($scope,   appsCrud,   $sce,   $location){
            $scope.query = $location.search();
            $scope.appTypeList = [
                {name: '工具', key: 'tool'},
                {name: '游戏', key: 'game'},
                {name: '控件', key: 'code'},
                {name: '库', key: 'library'}
            ];
            $scope.blocks = [
                {
                    name: '热门应用',
                    apps: [],
                    message: '正在加载热门应用...'
                },
                {
                    name: '最新应用',
                    apps: [],
                    message: '正在加载最新应用...'
                },
                {
                    name: '所有应用',
                    apps: [],
                    message: '正在加载应用...'
                },
            ];
            
            appsCrud.getPublishedApps({
                name: $scope.query.name,
                type: $scope.query.type,
                sort: 'stars'
            })
            .success(function(data){
                $scope.blocks[0].apps = data.apps;
                data.apps.forEach(function(n, i){
                    n.url = $sce.trustAsResourceUrl('/_apps/preview/' + n._id);
                });
            })
            .then(function(){
                $scope.blocks[0].message = '';
            });
            
            appsCrud.getPublishedApps({
                name: $scope.query.name,
                type: $scope.query.type,
                sort: 'createDate'
            })
            .success(function(data){
                $scope.blocks[1].apps = data.apps;
                data.apps.forEach(function(n, i){
                    n.url = $sce.trustAsResourceUrl('/_apps/preview/' + n._id);
                });
            })
            .then(function(){
                $scope.blocks[1].message = '';
            });

            var skip = 0;
            var last = false;
            $scope.load = function(){
                if(last){
                    return;
                }
                
                
                $scope.blocks[2].message = '正在加载应用...';
                appsCrud.getPublishedApps({
                    name: $scope.query.name,
                    type: $scope.query.type,
                    skip: skip
                })
                .success(function(data){
                    if(data.apps.length){
                        skip++;
                        $scope.blocks[2].apps.push.apply($scope.blocks[2].apps, data.apps);
                        data.apps.forEach(function(n, i){
                            n.url = $sce.trustAsResourceUrl('/_apps/preview/' + n._id);
                        });
                    }else{
                        last = true;
                    }
                })
                .then(function(){
                    $scope.blocks[2].message = '';
                });
            };

            $scope.load();
        }
    ]);
});