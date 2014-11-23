define(['js/app'], function(app){
    app
    .controller('snippetDetailCtrl',
    ['$scope', '$sce', '$routeParams', 'snippetsCrud',
        function($scope,   $sce,   $routeParams, snippetsCrud){
            $scope.url = $sce.trustAsResourceUrl('/_snippets/preview/' + $routeParams.id);

            $scope.setLoad({
                loading: true,
                loadMessage: '载入代码片段详细'
            });
            snippetsCrud.get($routeParams.id)
            .success(function(data){
                $scope.snippet = data.snippet;
            });
        }
    ])
});