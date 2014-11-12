define(['js/app'], function(app){
    app
    .factory('messageCurd',
    ['$http',
        function($http){
            return {
                getMessages: function(){
                    return $http.get('/_get/messages');
                },
                save: function(data){
                    return $http.post('/post/save/message', data);
                },
                add: function(data){
                    return $http.post('/post/add/message', data);
                }
            };
        }
    ])

    .controller('messageCtrl',
    ['$scope', 'messageCurd', 'prompt', '$window',
        function($scope,   messageCurd,   prompt,   $window){
            $scope.label = '内容';
            $scope.data = {};
            $scope.current = null;

            $scope.setLoad({
                loading: true,
                loadMessage: '载入留言...'
            });

            messageCurd.getMessages()
            .success(function(data){
                $scope.messages = data.messages;
            });

            $scope.response = function(msg, user){
                $scope.current = msg;
                $scope.label = '回复 ' + user;
                $scope.data.to = user;
                $window.scrollTo(0, 0);
            };

            $scope.cancel = function(){
                $scope.current = null;
                $scope.data = {};
                $scope.label = '内容';
            };

            $scope.submit = function(){
                if(!$scope.current){
                    messageCurd.add($scope.data)
                    .success(function(data){
                        $scope.messages.unshift(data.message);
                        $scope.current = null;
                        $scope.data = {};
                        $scope.label = '内容';
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
                    messageCurd.save(data)
                    .success(function(data){
                        $scope.current.responses = data.responses;
                        $scope.current = null;
                        $scope.data = {};
                        $scope.label = '内容';
                        prompt({
                            content: '回复成功'
                        });
                    })
                }
            };
        }
    ]);
});