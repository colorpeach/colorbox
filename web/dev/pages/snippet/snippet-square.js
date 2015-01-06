define(['js/app'], function(app){
    app
    .controller('snippetSquareCtrl',
    ['$scope', 'data::store', '$location',
        function($scope,   store,   $location){
            $scope.snippets = store.get('snippet', 'getAllSnippets', 'snippets');

            $scope.submit = function(){
                $scope.setLoad({
                    loading: true,
                    loadMessage: '载入代码片段'
                });
                store('snippet', 'getAllSnippets', true)
                .success(function(data){
                    $scope.snippets = data.snippets;
                });
            };
        }
    ]);
});