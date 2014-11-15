define(['js/app'], function(app){
    app

    .controller('dashboardCtrl', 
    ['$scope', '$routeParams',
        function($scope,   $routeParams){
            $scope.tab = $routeParams.tab;
            $scope.status = {
                account: 'normal',
                apps: 'normal',
                snippets: 'normal'
            };
        }
    ])
});