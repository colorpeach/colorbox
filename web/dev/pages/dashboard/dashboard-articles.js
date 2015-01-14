define(['js/app'], function(app){
    app

    .factory('articleCrud',
    ['$http',
        function($http){
            return {
            };
        }
    ])
    
    .controller('myArticlesCtrl',
    ['$scope', 'data::store', '$location', 'prompt', '$window', 'config',
        function($scope,   store,   $location,   prompt,   $window,   config){
            $scope.defaultName = config.articleDefaultName;

            $scope.setLoad({
                loading: true,
                loadMessage: '加载文档列表'
            });
            store('article', 'getArticles')
            .success(function(data){
                $scope.articles = data.articles;
            });

            $scope.addArticle = function(){
                store('article', 'add', {})
                .success(function(data){
                    $scope.articles.push(data.article);
                    $location.path('/edit/article');
                    $location.search('_id', data.article._id);
                });
            };

            $scope.delArticle = function(e, $index){
                e.preventDefault();

                var sure = $window.confirm('删除将无法撤销，确认删除？');

                if(!sure){
                    return;
                }

                var article = $scope.articles.splice($index, 1)[0];
                
                store('article', 'del', article._id)
                .success(function(data){
                    prompt({
                        content: '已删除：' + (article.name || $scope.defaultName)
                    });
                });
            };
        }
    ]);
});
