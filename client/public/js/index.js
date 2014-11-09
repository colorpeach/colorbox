define(['js/app'], function(app){
    app
    .factory('desktopCurd',
    ['$http',
        function($http){
            return {
                getDesktopApps: function(){
                    return $http.get('/get/desktop/apps');
                },
                updateDesktopApps: function(data){
                    return $http.post('/post/save/desktop/apps', data);
                }
            };
        }
    ])

    .factory('safeApply',
    ['$rootScope',
        function($rootScope){
            return function(fn) {
                var phase = $rootScope.$$phase;
                if(phase == '$apply' || phase == '$digest') {
                    if(fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                }else {
                    this.$apply(fn);
                }
            };
        }
    ])

    .controller('desktopCtrl',
    ['$scope', 'desktopCurd', 'safeApply', '$timeout', '$sce', '$rootScope',
        function($scope,   desktopCurd,   safeApply,   $timeout,   $sce,   $rootScope){
            var addButton = {isButton: true, addButton: true, position: {left: 0, top: 0}};

            $scope.status = {};
            $scope.allowDrag = true;

            desktopCurd.getDesktopApps()
            .success(function(data){
                if(data.desktopApps && data.desktopApps.length){
                    $scope.apps = data.desktopApps;
                    data.desktopApps.forEach(function(n, i){
                        n.url = $sce.trustAsResourceUrl('/_apps/preview/' + n._id);
                    });
                }else{
                    $scope.apps = [addButton];
                }
            })
            .error(function(){
                $scope.apps = [addButton];
            });

            $scope.$on('updateDesktop', function(){
                desktopCurd.updateDesktopApps({desktopApps: $scope.apps});
            });

            $scope.switchStatus = function(type){
                if(type === 'add'){
                    $scope.status.adding = !$scope.status.adding;
                }
            };

            $scope.removeApp = function(i){
                $scope.apps.splice(i, 1);
                $rootScope.$broadcast('updateDesktop');
            };
        }
    ])


    .factory('dragPlaceholder',
    [
        function(){
            //生成占位元素
            return function(el, contain, hasScreenshots){
                var div = angular.element('<div>');
                var rect = el[0].getBoundingClientRect();
                var css = {};

                require(['html2canvas'], function(){
                    hasScreenshots &&
                    html2canvas(el[0], {
                        onrendered: function(canvas){
                            div.append(canvas);
                        }
                    })
                });

                css.width = rect.right - rect.left +'px';
                css.height = rect.bottom - rect.top +'px';
                css.marginTop = css.marginLeft = '10px';

                div.addClass('drag-temp');
                div.css(css);

                contain.append(div);

                return div;
            }
        }
    ])

    .factory('calcMethods', 
    [
        function(){
            var cell = {
                x: 120,
                y: 120
            };
            var offset = 20;

            return {
                position: function(item, point, containRect, contain){
                    return {
                        left: Math.floor((contain.scrollLeft + point.x - containRect.left)/cell.x) * cell.x + 'px',
                        top: Math.floor((contain.scrollTop + point.y - containRect.top)/cell.y) * cell.y + 'px',
                        width: (item.size && item.size.x ? item.size.x * cell.x : cell.x) - offset + 'px',
                        height: (item.size && item.size.y ? item.size.y * cell.y : cell.y) - offset + 'px'
                    }
                },
                //判断预设位置是否正确
                positionIsRight: function(position, containRect, items, index){
                    var itemRect = {};
                    var overlap;

                    angular.forEach(position, function(n, i){
                        itemRect[i] = parseFloat(n);
                    });

                    itemRect.right = itemRect.left + itemRect.width;
                    itemRect.bottom = itemRect.top + itemRect.height;

                    //预设位置不在包含框内
                    //预设位置与其他重叠
                    if(itemRect.left < 0 ||
                        itemRect.top < 0 ||
                        itemRect.right > containRect.width
                        ){
                        return false;
                    }

                    //遍历其他应用
                    for(var i=0, len=items.length;i<len;i++){
                        if(i !== index && (overlap = isOverlap(itemRect, calcRect(items[i].position)))){
                            break;
                        }
                    }

                    return !overlap;
                }
            };

            //判断两个item是否有重叠
            function isOverlap(rect, aRect){
                return !(rect.left > aRect.right ||
                        rect.top > aRect.bottom ||
                        rect.right < aRect.left ||
                        rect.bottom < aRect.top);
            }

            function calcRect(position){
                var rect = {};
                rect.top = parseFloat(position.top);
                rect.left = parseFloat(position.left);
                rect.width = parseFloat(position.width) || cell.x - offset;
                rect.height = parseFloat(position.height) || cell.y - offset;
                rect.right = rect.left + rect.width;
                rect.bottom = rect.top + rect.height;
                return rect;
            }
        }
    ])

    .directive('dragItem', 
    ['utils', '$window', 'dragPlaceholder', '$timeout', '$rootScope', 'calcMethods', '$sce',
        function(utils, $window, dragPlaceholder, $timeout, $rootScope, calcMethods, $sce){
            return {
                restrict: 'A',
                compile: function(){
                    return function(scope, element, attrs){
                        var timer;

                        element.find('a').bind('click', function(e){
                            if(!scope.allowDrag) return;
                            e.preventDefault();
                            scope.app.show = !scope.app.show;
                        });

                        element.bind('mousedown touchstart', function(e){
                            if(!scope.allowDrag) return;
                            if(e.target.tagName !== 'SELECT')
                                e.preventDefault();

                            if(timer){
                                $timeout.cancel(timer);
                            }

                            timer = $timeout(function(){
                                startDrag(e);
                            }, 300);
                        });

                        element.bind('mouseup', function(){
                            if(timer){
                                $timeout.cancel(timer);
                            }
                        });

                        function startDrag(e){
                            var item = scope.getDrapData(scope.$index);
                            var positionIsRight = true;
                            var $overlay = angular.element('<div class="resize-overlay"></div>');
                            var $moveContain = angular.element($window.document.body);
                            var $drag = dragPlaceholder(element, $moveContain, true);
                            //TODO 使用了queryselector，待改进
                            var $contain = angular.element($moveContain[0].querySelector('.desktop-added-list'));
                            var containRect = $contain[0].getBoundingClientRect();
                            var $placeholder = dragPlaceholder(element, $contain);
                            var rect = element[0].getBoundingClientRect();
                            var position = {
                                top: '-100%',
                                left: '-100%'
                            };
                            var moveTimer;
                            var relative = {};
                            var point = {};

                            item.draging = true;
                            $rootScope.$apply();
                            $rootScope.$broadcast('dragStart');

                            if(e.touches){
                                relative.x = e.touches[0].clientX - rect.left;
                                relative.y = e.touches[0].clientY - rect.top;
                            }else{
                                relative.x = e.clientX - rect.left;
                                relative.y = e.clientY - rect.top;
                            }

                            $drag.css({
                                left: rect.left + 'px',
                                top: rect.top + 'px'
                            });

                            $placeholder.css(position);
                            $placeholder.html('');
                            $placeholder.addClass('drag-placeholder');
                            $contain.append($placeholder);
                            $moveContain.append($overlay);

                            position = calcMethods.position(item, point, containRect, $contain[0]);
                            positionIsRight = calcMethods.positionIsRight(position, containRect, $contain.scope().apps, scope.$index);

                            //TODO 暂时写法
                            if(!item.size){
                                item.size = {};
                                item.size.showIframe = 'false';
                            }

                            $moveContain.bind('mousemove touchmove', function(e){
                                if(e.touches){
                                    point = {
                                        x: e.touches[0].clientX,
                                        y: e.touches[0].clientY
                                    };
                                }else{
                                    point = {
                                        x: e.clientX,
                                        y: e.clientY
                                    };
                                }

                                $drag.css({
                                    left: point.x - relative.x + 'px',
                                    top: point.y - relative.y + 'px'
                                });

                                if(moveTimer){
                                    $timeout.cancel(moveTimer);
                                }

                                moveTimer = $timeout(function(){
                                    position = calcMethods.position(item, point, containRect, $contain[0]);
                                    positionIsRight = calcMethods.positionIsRight(position, containRect, $contain.scope().apps, scope.$index);
                                    $placeholder[positionIsRight ? 'removeClass' : 'addClass']('wrong');
                                    $placeholder.css(position);
                                }, 50);
                            });

                            $moveContain.bind('mouseup touchend', function(e){
                                $moveContain.off('mousemove');
                                $moveContain.off('mouseup');

                                if(moveTimer){
                                    $timeout.cancel(moveTimer);
                                }

                                $placeholder.remove();
                                $overlay.remove();
                                $drag.remove();

                                if(positionIsRight &&
                                    point.x < containRect.left + containRect.width &&
                                    point.y < containRect.top + containRect.height){
                                    item.position = position;
                                    if(scope.$parent !== $contain.scope()){
                                        $contain.scope().add(item);
                                    }
                                    $rootScope.$broadcast('updateDesktop');
                                }
                                
                                item.draging = false;
                                $rootScope.$apply();
                                $rootScope.$broadcast('dragEnd');
                            });
                        }
                    }
                }
            }
        }
    ])

    .directive('dragBox',
    [
        function(){
            return {
                restrict: 'A',
                compile: function(){
                    return function(scope, element, attrs){
                        scope.add = function add(item, i){
                            if(i !== undefined){
                                scope[attrs.dragBox].splice(i, 0, item);
                            }else{
                                scope[attrs.dragBox].push(item);
                            }
                        };

                        scope.remove = function(i){
                            return scope[attrs.dragBox].splice(i, 1);
                        };

                        scope.getDrapData = function(i){
                            return scope[attrs.dragBox][i];
                        };
                    };
                }
            };
        }
    ])

    .directive('dragContain', 
    [
        function(){
            return {
                restrict: 'A',
                compile: function(){
                    return function(scope, element, attrs){
                        scope.add = function add(item, i){
                            if(i !== undefined){
                                scope[attrs.dragContain].splice(i, 0, item);
                            }else{
                                scope[attrs.dragContain].push(item);
                            }
                        };

                        scope.$on('dragStart', function(){
                            element.addClass('draging');
                            element.parent().addClass('draging');
                        });

                        scope.$on('dragEnd', function(){
                            element.removeClass('draging');
                            element.parent().removeClass('draging');
                        });
                    };
                }
            };
        }
    ])
});