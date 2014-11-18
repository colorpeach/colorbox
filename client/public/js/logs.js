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
    ['$scope', 'logsCrud',
        function($scope,   logsCrud){
            logsCrud.get()
            .success(function(data){
                $scope.logs = data.logs;
            });
        }
    ])
})