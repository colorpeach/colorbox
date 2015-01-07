define(['js/app'], function(app){
    app
    .controller('snippetSquareCtrl',
    ['$scope', 'data::store', '$location', 'prompt',
        function($scope,   store,   $location,   prompt){
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

            $scope.fork = function(e, id){
                e.preventDefault();
                $scope.setLoad({
                    loading: true,
                    loadMessage: '正在fork'
                });

                store('snippet', 'addFork', id)
                .success(function(data){
                    prompt({
                        content: 'Fork成功'
                    });
                    $location.path('/edit/snippet/' + data.snippet._id);
                });
            };
        }
    ]);
});