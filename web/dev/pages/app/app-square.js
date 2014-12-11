define(['js/app'], function(app){
    app

    .controller('appSquareCtrl', 
    ['$scope', 'appsCrud', '$sce', '$location',
        function($scope,   appsCrud,   $sce,   $location){
            $scope.displayApps = [];
            $scope.isShow = false;
            var skip = 0;
            var last = false;

            $scope.search = function(){
                $scope.isShow = true;
                skip = 0;
                last = false;

                $scope.setLoad({
                    loading: true,
                    loadMessage: '正在加载应用...'
                });

                appsCrud.getPublishedApps({name: $scope.searchName})
                .success(function(data){
                    skip++;
                    $scope.displayApps = data.apps;
                    data.apps.forEach(function(n, i){
                        n.url = $sce.trustAsResourceUrl('/_apps/preview/' + n._id);
                    });
                });
            };

            $scope.cancelSearch = function($event){
                $event.preventDefault();
                $scope.searchName = '';
                $scope.isShow = false;
                $scope.displayApps = [];
            };
            
            $scope.load = function(){
                if(last || $scope.message){
                    return;
                }
                
                $scope.message = '正在加载应用...';
                appsCrud.getPublishedApps({name: $scope.searchName, skip: skip})
                .success(function(data){
                    if(data.apps.length){
                        skip++;
                        $scope.displayApps.push.apply($scope.displayApps, data.apps);
                        data.apps.forEach(function(n, i){
                            n.url = $sce.trustAsResourceUrl('/_apps/preview/' + n._id);
                        });
                    }else{
                        last = true;
                    }
                })
                .then(function(){
                    $scope.message = '';
                });
            };
        }
    ]);
});