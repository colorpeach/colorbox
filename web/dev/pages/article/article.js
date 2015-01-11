define(['js/app'], function(app){
    app

    .controller('articleCtrl',
    ['$scope', 'data::store', '$routeParams', 'config',
        function($scope,   store,   $routeParams,   config){
            $scope.menu = false;
            
            $scope.setLoad({
                loading: true,
                loadMessage: '加载文档'
            });
            store('article', 'get', $routeParams.id)
            .success(function(data){
                $scope.articleDefaultName = config.articleDefaultName;
                $scope.article = data.article;
            });

            $scope.toggleMenu = function(){
                $scope.menu = !$scope.menu;
            };
        }
    ]);
});