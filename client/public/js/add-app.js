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
                1: {dir: 'h', list: [['jade', 'css', 'js'], ['preview']]},
                2: {dir: 'v', list: [['jade', 'js'], ['css', 'preview']]},
                3: {dir: 'v', list: [['jade', 'css', 'js'], ['preview']]},
                4: {dir: 'h', list: [['jade', 'css', 'js', 'preview']]}
            };
        var boxs = {
                jade: {show: true, index: 0},
                css: {show: true, index: 1},
                js: {show: true, index: 2},
                preview: {show: true, index: 3}
            };
        return {
            restrict: 'A',
            compile: function(){
                return function(scope, element, attrs){
                    var $boxs = element.children();
                    scope.layoutIndex = 1;
                    scope.layouts = layouts;
                    scope.boxs = boxs;

                    scope.$watch('layoutIndex', updateView);
                    scope.toggle = function(box){
                        box.show = !box.show;
                        updateView(scope.layoutIndex);
                    };

                    function updateView(layoutIndex){
                        if(!layoutIndex) return;
                        var layout = scope.layouts[layoutIndex];
                        var i = 0;
                        var MainLength = calcLength(layout.list, true);

                        layout.list.forEach(function(n){
                            var j = 0;
                            var supportLength = calcLength(n);
                            
                            n.forEach(function(m){
                                var css = {position: 'absolute', display: boxs[m].show ? 'block' : 'none'};
                                var stepX, stepY;

                                if(layout.dir === 'h'){
                                    //编辑窗口可以横向伸展
                                    stepX = 100/supportLength;
                                    stepY = 100/MainLength;
                                    css.left = stepX * j + '%';
                                    css.top = stepY * i + '%';
                                }else{
                                    stepY = 100/supportLength;
                                    stepX = 100/MainLength;
                                    css.left = stepX * i + '%';
                                    css.top = stepY * j + '%';
                                }
                                
                                css.height = stepY + '%';
                                css.width = stepX + '%';
                                
                                $boxs.eq(boxs[m].index).css(css);
                                
                                boxs[m].show && j++;
                            });
                            
                            j && i++;
                        });

                    }
                    
                    function calcLength(list, isOut){
                        var l = 0;
                        
                        if(isOut){
                            list.forEach(function(n, i){
                                l += calcLength(n) ? 1 : 0;
                            });
                        }else{
                            list.forEach(function(n, i){
                                if(boxs[n].show) l++;
                            });
                        }
                        
                        return l;
                    }
                }
            }
        };
    }
])

.directive('resizeBar', 
[
    function(){
        return {
            restrict: 'A'
        };
    }
]);