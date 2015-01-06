define(['js/app'], function(app){
    app
    .controller('logsCtrl', 
    ['$scope', 'data::store', '$sce',
        function($scope,   store,   $sce){
            store('log', 'get')
            .success(function(data){
                angular.forEach(data.logs, function(n){
                    n.content = $sce.trustAsHtml(n.content);
                });
                $scope.logs = data.logs;
            });
        }
    ])
})