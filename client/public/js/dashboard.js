define(['js/app'], function(app){
    app

    .controller('dashboardCtrl', 
    ['$scope', '$routeParams', '$rootScope',
        function($scope,   $routeParams,   $rootScope){
            $scope.tab = $routeParams.tab;
            $scope.user = $rootScope.user.login;
            $scope.status = {
                account: 'normal',
                apps: 'normal',
                snippets: 'normal'
            };
        }
    ])
});