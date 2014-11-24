define(['js/app'], function(app){
    app
    .factory('logsCrud',
    ['$http',
        function($http){
            return {
                get: function(){
                    return $http.get('/_get/logs', {cache: true});
                }
            };
        }
    ])
    .controller('logsCtrl', 
    ['$scope', 'logsCrud', '$sce',
        function($scope,   logsCrud,   $sce){
            logsCrud.get()
            .success(function(data){
                angular.forEach(data.logs, function(n){
                    n.content = $sce.trustAsHtml(n.content);
                });
                $scope.logs = data.logs;
            });
        }
    ])
})