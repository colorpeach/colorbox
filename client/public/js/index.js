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
    ['$scope', 'desktopCurd', 'safeApply', '$timeout', '$sce',
        function($scope,   desktopCurd,   safeApply,   $timeout,   $sce){
            var addButton = {isButton: true, addButton: true, position: {left: 0, top: 0}};
            var init = false;

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
            })
            .then(function(){
                $timeout(function(){
                    init = true;
                }, 0);
            });

            $scope.$watch('apps.length', function(){
                init && desktopCurd.updateDesktopApps({desktopApps: $scope.apps});
            });

            $scope.switchStatus = function(type){
                if(type === 'add'){
                    $scope.status.adding = !$scope.status.adding;
                }
            };

            $scope.removeApp = function(i){
                $scope.apps.splice(i, 1);
            };
        }
    ])


    .factory('dragPlaceholder',
    [
        function(){
            //生成占位元素
            return function(el, contain, isInsert){
                var clone = el.clone();

                var style = clone[0].style;
                var rect = el[0].getBoundingClientRect();
                var css = {};

                //定位元素
                if(style.position === 'absolute' || style.position === 'fixed'){
                    css.top = style.top;
                    css.right = style.right;
                    css.bottom = style.bottom;
                    css.left = style.left;
                }

                if(!style.width){
                    //TODO 判断太长，不够全面，需优化
                    if(!(
                        clone[0].tagName === 'DIV'
                        && (!style.display || style.display === 'block')
                        && style.float !== 'left'
                        && style.float !== 'right'
                        && style.position !== 'absolute'
                        && style.position !== 'fixed'
                    )){
                        css.width = rect.right - rect.left +'px';
                    }
                }
                if(!style.height){
                    css.height = rect.bottom - rect.top +'px';
                }

                clone.addClass('drag-temp');
                clone.css(css);

                if(isInsert){
                    el.after(clone);
                }else{
                    (contain).append(clone);
                }

                return clone;
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
                positionIsRight: function(position, containRect, items){
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
                        if(overlap = isOverlap(itemRect, calcRect(items[i].position))){
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
    //             require: ['dragBox'],
                compile: function(){
                    return function(scope, element, attrs){
                        var timer;

                        element.find('a').bind('click', function(e){
                            if(!scope.allowDrag) return;
                            e.preventDefault();
                            scope.app.show = !scope.app.show;
                        });

                        element.bind('mousedown', function(e){
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
                            var item = scope.remove(scope.$index);
                            var positionIsRight = true;
                            var $overlay = angular.element('<div class="resize-overlay"></div>');
                            var $moveContain = angular.element($window.document.body);
                            var $drag = dragPlaceholder(element, $moveContain);
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

                            $rootScope.$broadcast('dragStart');

                            relative.x = e.clientX - rect.left;
                            relative.y = e.clientY - rect.top;

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
                            positionIsRight = calcMethods.positionIsRight(position, containRect, $contain.scope().apps);

                            //TODO 暂时写法
                            if(!item.size){
                                item.size = {};
                                item.size.showIframe = 'false';
                            }

                            $moveContain.bind('mousemove', function(e){
                                point = {
                                    x: e.clientX,
                                    y: e.clientY
                                };

                                $drag.css({
                                    left: point.x - relative.x + 'px',
                                    top: point.y - relative.y + 'px'
                                });

                                if(moveTimer){
                                    $timeout.cancel(moveTimer);
                                }

                                moveTimer = $timeout(function(){
                                    position = calcMethods.position(item, point, containRect, $contain[0]);
                                    positionIsRight = calcMethods.positionIsRight(position, containRect, $contain.scope().apps);
                                    $placeholder[positionIsRight ? 'removeClass' : 'addClass']('wrong');
                                    $placeholder.css(position);
                                }, 50);
                            });

                            $moveContain.bind('mouseup', function(e){
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
                                    $contain.scope().add(item);
                                }else{
                                    scope.add(item, scope.$index);
                                }

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

                        scope.remove = function remove(i){
                            return scope[attrs.dragBox].splice(i, 1)[0];
                        }
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