define(['js/app'], function(app){
    app
    .factory('snippetsCrud', 
    ['$http',
        function($http){
            return {
                get: function(id){
                    return $http.get('/get/snippet?_id='+ id);
                },
                add: function(data){
                    return $http.post('/post/add/snippet', data);
                },
                del: function(id){
                    return $http.post('/post/del/snippet', {_id: id});
                },
                save: function(data){
                    return $http.post('/post/save/snippet', data);
                },
                getSnippets: function(){
                    return $http.get('/_get/user/snippets', {cache: true});
                },
                getAllSnippets: function(){
                    return $http.get('/_get/snippets');
                }
            };
        }
    ])

    .controller('mySnippetsCtrl',
    ['$scope', 'snippetsCrud', 'prompt',
        function($scope, snippetsCrud, prompt){
            if($scope.tab !== 'snippets'){
                return;
            }
            
            $scope.current = {};
            $scope.status = {
                page: 'list'
            };

            $scope.setLoad({
                loading: true,
                loadMessage: '载入代码片段列表...'
            });
            
            snippetsCrud.getSnippets()
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
                snippetsCrud.add($scope.data)
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
                snippetsCrud.del($scope.current._id)
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
                snippetsCrud.save($scope.current)
                .success(function(){
                    prompt({
                        content: '保存成功'
                    });
                });
            };
        }
    ]);
});