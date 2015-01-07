define(['js/app'], function(app){
    app
    .controller('snippetSquareCtrl',
    ['$scope', 'data::store', '$location',
        function($scope,   store,   $location){
            $scope.snippets = store.get('snippet', 'getSnippetsFuzzy', 'snippets');
            var limit = 30;
            var skip = 0;
            var last = false;

            $scope.submit = function(){
                last = false;
                skip = 0;

                $scope.setLoad({
                    loading: true,
                    loadMessage: '载入代码片段'
                });
                store('snippet', 'getSnippetsFuzzy', {name: $scope.searchName, skip: skip, limit: limit})
                .success(function(data){
                    skip++;
                    $scope.snippets = data.snippets;
                });
            };
        }
    ]);
});