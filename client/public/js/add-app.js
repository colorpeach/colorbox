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
['utils', '$compile',
    function(utils,   $compile){
        var resizeBarHCss = {marginTop: '-5px', height: '10px'};
        var resizeBarVCss = {marginLeft: '-5px', width: '10px'};
        var layouts = {
                0: {dir: 'h', list: [['jade', 'css', 'js'], ['preview']]},
                1: {dir: 'v', list: [['jade', 'js'], ['css', 'preview']]},
                2: {dir: 'v', list: [['jade', 'css', 'js'], ['preview']]},
                3: {dir: 'h', list: [['jade', 'css', 'js', 'preview']]}
            };
        var boxs = {
                jade: {show: true, index: 0},
                css: {show: true, index: 1},
                js: {show: true, index: 2},
                preview: {show: true, index: 3}
            };
        var resizeBarTpl = utils.heredoc(function(){/*!
                <div resize-bar class="resize-bar"></div><div resize-bar class="resize-bar"></div><div resize-bar class="resize-bar"></div>
            */});
                    
        //计算实际显示的行或列的个数
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
        //根据布局方向返回css
        function setCss(dir, valList){
            var list = dir === 'h' ? ['width', 'height', 'left', 'top'] : ['height', 'width', 'top', 'left'];
            var css = {};

            list.forEach(function(n, i){
                css[n] = valList[i];
            });

            return css;
        }
        
        return {
            restrict: 'A',
            compile: function(){
                return function(scope, element, attrs){
                    var $boxs = element.children();
                    var $resizeBars = angular.element(resizeBarTpl);
                    var resizeMap = {};

                    scope.layoutIndex = 0;
                    scope.layouts = layouts;
                    scope.boxs = boxs;

                    scope.$watch('layoutIndex', updateView);
                    scope.toggle = function(box){
                        box.show = !box.show;
                        updateView(scope.layoutIndex);
                    };

                    $compile($resizeBars)(scope);
                    element.append($resizeBars);
                    
                    //根据layout和boxs更新布局
                    function updateView(layoutIndex){
                        var layout = scope.layouts[layoutIndex || 0];
                        var resizeBarIndex = 0;
                        var groupIndex = 0;
                        var lastGroup;
                        var mainLength = calcLength(layout.list, true);

                        $resizeBars.removeClass('dir-h dir-v');

                        layout.list.forEach(function(n){
                            var itemIndex = 0;
                            var lastItem;
                            var supportLength = calcLength(n);
                            
                            n.forEach(function(m){
                                var boxCss = {position: 'absolute', display: boxs[m].show ? 'block' : 'none'};
                                var css = setCss(layout.dir, [100/supportLength + '%', 100/mainLength + '%', 100/supportLength * itemIndex + '%', 100/mainLength * groupIndex + '%']);

                                $boxs.eq(boxs[m].index).css(angular.extend({}, css, boxCss));
                                if(itemIndex){
                                    //当前group有item显示
                                    $resizeBars.eq(resizeBarIndex)
                                        .css(angular.extend({}, css, layout.dir === 'h' ? resizeBarVCss : resizeBarHCss))
                                        .addClass(layout.dir === 'h' ? 'dir-v' : 'dir-h')
                                        //记录调整尺寸的目标
                                        .data('resizeTarget', {last: lastItem, next: m});
                                }
                                
                                if(boxs[m].show){
                                    lastItem = m;
                                    itemIndex++ && resizeBarIndex++;
                                }
                            });

                            if(groupIndex){
                                //当前group至少有一个item显示
                                $resizeBars.eq(resizeBarIndex)
                                    .css(setCss(layout.dir, ['100%', '10px', 0, 100 * groupIndex/mainLength + '%']))
                                    .css(layout.dir === 'h' ? {marginTop: '-5px'} : {marginLeft: '-5px'})
                                    .addClass(layout.dir === 'h' ? 'dir-h' : 'dir-v')
                                    //记录调整尺寸的目标
                                    .data('resizeTarget', {last: lastGroup, next: n});
                            }

                            if(itemIndex){
                                lastGroup = n;
                                groupIndex++ && resizeBarIndex++;
                            }
                        });
                    }
                }
            }
        };
    }
])

.directive('resizeBar', 
['utils', 
    function(utils){
        var resizeMarkTpl = utils.heredoc(function(){/*!
                <div class="resize-mark"></div>
            */});
        var resizeOverlayTpl = utils.heredoc(function(){/*!
                <div class="resize-overlay"></div>
            */});
        
        return {
            restrict: 'A',
            compile: function(){
                return function(scope, element, attrs){

                    element.on('mousedown', function(e){
                        e.preventDefault();
                        var dir = element.hasClass('dir-h') ? 'y' : 'x';
                        var $resizeMark = angular.element(resizeMarkTpl);
                        var $resizeOverlay = angular.element(resizeOverlayTpl);
                        var $parent = element.parent();
                        var pRect = $parent[0].getBoundingClientRect();
                        var rect = element[0].getBoundingClientRect();
                        var relative;

                        if(dir === 'x'){
                            relative = e.clientX - pRect.left;
                            $resizeMark.css({
                                top: rect.top - pRect.top + 'px',
                                left: rect.left - pRect.left + 'px',
                                width: '1px',
                                height: rect.height + 'px'
                            });
                        }else{
                            relative = e.clientY - pRect.top;
                            $resizeMark.css({
                                top: rect.top - pRect.top + 'px',
                                left: rect.left - pRect.left + 'px',
                                width: rect.width + 'px',
                                height: '1px'
                            });
                        }
                        
                        $parent.append($resizeMark).append($resizeOverlay);

                        $parent.on('mousemove', function(e){
                            var point = {
                                x: e.clientX - pRect.left,
                                y: e.clientY - pRect.top
                            }

                            $resizeMark.css(dir === 'x' ? {left: point.x + 'px'} : {top: point.y + 'px'});
                        });

                        $parent.on('mouseup', function(e){
                            $resizeMark.remove();
                            $resizeOverlay.remove();
                            $parent.off('mousemove');
                            $parent.off('mouseup');
                            resize(element, dir, pRect, {
                                x: e.clientX - pRect.left,
                                y: e.clientY - pRect.top
                            });
                        });
                    });

                    function resize(element, dir, pRect, point){
                        var resizeTarget = element.data('resizeTarget');
                        var $boxs = element.parent().children();

                        if(typeof resizeTarget.last === 'string'){
                            //resizeBar的目标是item
                            if(dir === 'x'){
                                var left = point.x * 100/pRect.width + '%';
                                var lastRect = $boxs.eq(scope.boxs[resizeTarget.last].index)[0].getBoundingClientRect();
                                var nextRect = $boxs.eq(scope.boxs[resizeTarget.next].index)[0].getBoundingClientRect();

                                $boxs.eq(scope.boxs[resizeTarget.last].index).css({width: (point.x - lastRect.left) * 100/pRect.width + '%'});
                                $boxs.eq(scope.boxs[resizeTarget.next].index).css({left: left, width: (nextRect.left - point.x + nextRect.width) * 100/pRect.width + '%'});
                                element.css({left: left});
                            }else{
                                $boxs.eq(scope.boxs[resizeTarget.last].index).css();
                                $boxs.eq(scope.boxs[resizeTarget.next].index).css();
                            }
                        }else{
                            resizeTarget.last.forEach(function(n){
                                $boxs.eq(scope.boxs[n].index).css();
                            });
                        }
                    }
                };
            }
        };
    }
]);