angular.module('addApp', ['myApps'])

.controller('addAppCtrl',
['$scope', 'appsCrud', '$routeParams', '$window', '$sce',
    function($scope,   appsCrud,   $routeParams,   $window, $sce){
        $scope.data = {};
        appsCrud.get($routeParams.id)
        .success(function(data){
            $scope.data = data.app;
            $scope.previewUrl = $sce.trustAsResourceUrl('/apps/preview/' + data.app._id);
        });

        $scope.submit = function(e){
            e.preventDefault();
            appsCrud.save($scope.data)
            .success(function(){
                $window.frames[0].location.reload();
            });
        };

        $scope.save = function(e){
            if(e.ctrlKey && e.keyCode === 83){
                e.preventDefault();
                //ctrl + s
                $scope.submit(e);
            }
        };
    }
])

.directive('resizeBox',
[
    function(){
        var layouts = {
                1: [[1, 1, 1], [3]],
                2: [[1, 1], [1, 1]],
                3: [[3], [1, 1, 1]]
            };
        return {
            restrict: 'A',
            compile: function(){
                return function(scope, element, attrs){
                    var $boxs = element.children();
                    scope.layoutIndex = 1;
                    scope.layouts = layouts;

                    scope.switchLayout = function(i){
                        scope.layoutIndex = i;
                        scope.layout = layouts[scope.layoutIndex];
                    };

                    scope.$watch('layoutIndex', calc);

                    function calc(layoutIndex){
                        if(!layoutIndex) return;
                        var layout = scope.layouts[layoutIndex];
                        var row = layout.length;
                        var col = layout[0].reduce(function(x, y){return x+y;});
                        var index = 0;

                        layout.forEach(function(n, offsetY){
                            var offsetX = 0;

                            n.forEach(function(m){
                                $boxs.eq(index).css({
                                    position: 'absolute',
                                    width: m*100/col + '%',
                                    height: 100/row + '%',
                                    top: offsetY*100/row + '%',
                                    left: offsetX*100/col + '%'
                                });
                                offsetX += m;
                                index++;
                            });
                        });

                    }
                }
            }
        };
    }
]);