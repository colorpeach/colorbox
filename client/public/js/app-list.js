angular.module('appList', [])

.factory('appListCurd', 
['$http',
    function($http){
        return {
            getPublishedApps: function(name){
                return $http.get('/fetch/published/apps' + (name ? ('?name=' + name):''));
            }
        };
    }
])

.controller('appListCtrl', 
['$scope', 'appListCurd',
    function($scope,   appListCurd){
        $scope.apps = [];
        
        $scope.submit = function(e){
            e && e.preventDefault();
            appListCurd.getPublishedApps($scope.name)
            .success(function(data){
                $scope.apps = data.apps;
            });
        };
        
        $scope.submit();
    }
]);