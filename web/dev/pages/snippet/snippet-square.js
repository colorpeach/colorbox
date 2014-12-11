define(['js/app'], function(app){
    app
    .controller('snippetSquareCtrl',
    ['$scope', 'snippetsCrud', '$location',
        function($scope,   snippetsCrud,   $location){
            $scope.snippets = [];

            $scope.submit = function(){
                $scope.setLoad({
                    loading: true,
                    loadMessage: '载入代码片段'
                });
                snippetsCrud.getAllSnippets().
                success(function(data){
                    $scope.snippets = data.snippets;
                });
            };

            $scope.submit();
        }
    ]);
});