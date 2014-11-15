define(['js/app'], function(app){
    app
    .factory('appListCurd', 
    ['$http',
        function($http){
            return {
                getPublishedApps: function(name){
                    return $http.get('/_get/published/apps' + (name ? ('?name=' + name):''));
                }
            };
        }
    ])

    .controller('appListCtrl', 
    ['$scope', 'appListCurd', '$sce', '$location',
        function($scope,   appListCurd,   $sce,   $location){
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
                },
                {
                    name: '最新应用',
                    apps: [],
                },
                {
                    name: '所有应用',
                    apps: [],
                },
            ];
            
            appListCurd.getPublishedApps($scope.query.name)
            .success(function(data){
                $scope.blocks[0].apps = data.apps;
                $scope.blocks[1].apps = data.apps;
                $scope.blocks[2].apps = data.apps;
                data.apps.forEach(function(n, i){
                    n.url = $sce.trustAsResourceUrl('/_apps/preview/' + n._id);
                });
            });
        }
    ]);
});