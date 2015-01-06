define(['js/app'], function(app){
    app
    .controller('snippetDetailCtrl',
    ['$scope', '$sce', '$routeParams', 'data::store',
        function($scope,   $sce,   $routeParams,   store){
            $scope.url = $sce.trustAsResourceUrl('/_snippets/preview/' + $routeParams.id);

            $scope.setLoad({
                loading: true,
                loadMessage: '载入代码片段详细'
            });
            store('snippet', 'get', $routeParams.id)
            .success(function(data){
                $scope.snippet = data.snippet;
            });
        }
    ])
});