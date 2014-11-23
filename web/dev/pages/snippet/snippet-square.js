define(['js/app'], function(app){
    app
    .controller('snippetSquareCtrl',
    ['$scope', 'snippetsCrud', '$location',
        function($scope,   snippetsCrud,   $location){
            $scope.snippets = [];
//             $scope.query = $location.search();
            $scope.labels = {
                success: 'css3',
                alert: 'html5',
                '': '3d',
                warning: 'js'
            };

            snippetsCrud.getAllSnippets().
            success(function(data){
                $scope.snippets = data.snippets;
            });
        }
    ]);
});