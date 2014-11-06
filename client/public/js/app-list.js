angular.module('appList', [])

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
['$scope', 'appListCurd', '$sce',
    function($scope,   appListCurd,   $sce){
        $scope.apps = [];
        
        $scope.submit = function(e){
            e && e.preventDefault();
            appListCurd.getPublishedApps($scope.name)
            .success(function(data){
                $scope.apps = data.apps;
                $scope.apps.forEach(function(n, i){
                    n.url = $sce.trustAsResourceUrl('/_apps/preview/' + n._id);
                });
            });
        };
        
        $scope.submit();
    }
]);