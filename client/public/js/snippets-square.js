define(['js/app'], function(app){
    app
    .controller('snippetsSquareCtrl',
    ['$scope', 'snippetsCrud', '$location',
        function($scope,   snippetsCrud,   $location){
            $scope.snippets = [];
            $scope.query = $location.search();

            snippetsCrud.getAllSnippets().
            success(function(data){
                $scope.snippets = data.snippets;
            });
        }
    ]);
});