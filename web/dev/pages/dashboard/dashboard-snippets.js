define(['js/app'], function(app){
    app

    .controller('mySnippetsCtrl',
    ['$scope', 'data::store', 'prompt',
        function($scope, store, prompt){
            $scope.current = {};
            $scope.status = {
                page: 'list'
            };

            $scope.setLoad({
                loading: true,
                loadMessage: '载入代码片段列表...'
            });
            
            store('snippet', 'getSnippets')
            .success(function(data){
                $scope.snippets = data.snippets;
            });

            $scope.switch = function(e, page, app, $index){
                $scope.status.page = page;
                switch(page){
                    case 'add':
                        $scope.data = {};
                        $scope.errorMsg = [];
                    break;
                    case 'detail':
                        e.preventDefault();
                        $scope.current = app;
                        $scope.current.$index = $index;
                    break;
                    default:
                        $scope.current = {};
                }
            };

            $scope.add = function(){
                store('snippet', 'add', $scope.data)
                .success(function(data){
                    $scope.snippets.push(data.snippet);
                    prompt({
                        content: '添加代码片段成功'
                    });
                    $scope.switch(null, 'list');
                })
                .error(function(data){
                    if(data.error){
                        $scope.errorMsgs = data.errorMsg;
                    }
                });
            };

            $scope.del = function(){
                var sure = window.confirm('删除将无法撤销，确认删除？');

                if(!sure){
                    return;
                }
                store('snippet', 'del', $scope.current._id)
                .success(function(){
                    $scope.snippets.splice($scope.current.$index, 1);
                    prompt({
                        content: '删除成功'
                    });
                    $scope.switch(null, 'list');
                });
            };

            $scope.submit = function(e){
                e.preventDefault();
                store('snippet', 'save', $scope.current)
                .success(function(){
                    prompt({
                        content: '保存成功'
                    });
                });
            };
        }
    ]);
});