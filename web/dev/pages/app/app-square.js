define(['js/app'], function(app){
    app

    .controller('appSquareCtrl', 
    ['$scope', 'appProCrud', '$sce', '$location',
        function($scope,   appProCrud,   $sce,   $location){
            $scope.displayApps = [];
            $scope.isShow = false;
            var skip = 0;
            var last = false;
            var limit = 30;

            $scope.search = function(){
                $scope.isShow = true;
                skip = 0;
                last = false;
                $scope.hasAddedApps = $scope.apps.map(function(n){ return n._id});

                $scope.setLoad({
                    loading: true,
                    loadMessage: '正在加载应用...'
                });

                appProCrud.getPublishedApps({name: $scope.searchName, limit: limit})
                .success(function(data){
                    skip++;
                    $scope.displayApps = data.apps;
                    data.apps.forEach(function(n, i){
                        n.url = $sce.trustAsResourceUrl('/_app-pro/preview/' + n._id);
                    });
                });
            };

            $scope.cancelSearch = function($event){
                $event && $event.preventDefault();
                $scope.searchName = '';
                $scope.isShow = false;
                $scope.displayApps = [];
            };
            
            $scope.load = function(){
                if(last || $scope.message){
                    return;
                }
                
                $scope.message = '正在加载应用...';
                appProCrud.getPublishedApps({name: $scope.searchName, skip: skip, limit: limit})
                .success(function(data){
                    if(data.apps.length){
                        skip++;
                        $scope.displayApps.push.apply($scope.displayApps, data.apps);
                        data.apps.forEach(function(n, i){
                            n.url = $sce.trustAsResourceUrl('/_app-pro/preview/' + n._id);
                        });
                    }else{
                        last = true;
                    }
                })
                .then(function(){
                    $scope.message = '';
                });
            };

            $scope.addToDesktop = function(app){
                var data = {
                    name: app.name,
                    _id: app._id
                };
                $scope.$emit('addDesktopApp', data);
                $scope.cancelSearch();
            };
        }
    ]);
});