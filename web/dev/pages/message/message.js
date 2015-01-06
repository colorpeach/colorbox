define(['js/app'], function(app){
    app

    .controller('messageCtrl',
    ['$scope', 'data::store', 'prompt', '$window', '$rootScope', '$anchorScroll', '$location',
        function($scope,   store,   prompt,   $window,   $rootScope,   $anchorScroll,   $location){
            $scope.label = '留言';
            $scope.data = {};
            $scope.user = $rootScope.user;
            $scope.current = null;

            $scope.setLoad({
                loading: true,
                loadMessage: '载入留言...'
            });

            store('message', 'getMessages')
            .success(function(data){
                $scope.messages = data.messages;
            });

            $scope.passed = function(){
                return !!$rootScope.user;
            };

            $scope.response = function(msg, user){
                $scope.current = msg;
                $scope.label = '回复 ' + user;
                $scope.data.to = user;
                $location.hash('content');
                $anchorScroll();
            };

            $scope.cancel = function(){
                $scope.current = null;
                $scope.data = {};
                $scope.label = '留言';
            };

            $scope.submit = function(){
                if(!$scope.current){
                    store('message', 'add', $scope.data)
                    .success(function(data){
                        $scope.messages.unshift(data.message);
                        $scope.current = null;
                        $scope.data = {};
                        $scope.label = '留言';
                        prompt({
                            content: '留言成功'
                        });
                    });
                }else{
                    !$scope.current.responses && ($scope.current.responses = []);
                    $scope.current.responses.push($scope.data);
                    var data = {
                        _id: $scope.current._id,
                        responses: $scope.current.responses
                    };
                    store('message', 'save', data)
                    .success(function(data){
                        $scope.current.responses = data.responses;
                        $scope.current = null;
                        $scope.data = {};
                        $scope.label = '留言';
                        prompt({
                            content: '回复成功'
                        });
                    })
                }
            };
        }
    ]);
});