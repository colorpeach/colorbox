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

    .controller('desktopCtrl',
    ['$scope', 'desktopCurd', 'safeApply', '$timeout', '$sce', '$rootScope', 'calcMethods',
        function($scope,   desktopCurd,   safeApply,   $timeout,   $sce,   $rootScope,   calcMethods){
            $scope.apps = [];
            $scope.status = {};

            if($rootScope.user){
                //如果用户已经登录
                $scope.setLoad({
                    loading: true,
                    loadMessage: '载入桌面应用...'
                });

                desktopCurd.getDesktopApps()
                .success(function(data){
                    if(data.apps && data.apps.length){
                        $scope.apps = data.apps;
                        $scope.apps_id = data._id;
                        data.apps.forEach(function(n, i){
                            n.url = $sce.trustAsResourceUrl('/_app-pro/preview/' + n._id);
                        });
                    }
                });
            }

            $scope.$on('updateDesktop', function(){
                desktopCurd.updateDesktopApps({apps: $scope.apps, _id: $scope.apps_id})
                .success(function(data){
                    if(!$scope.apps_id){
                        $scope.apps_id = data._id;
                    }
                });
            });

            $scope.$on('addDesktopApp', function(e, app){
                $scope.addApp(app);
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

            $scope.addApp = function(app){
                var position = calcMethods.autoPosition($scope.apps);
                var had = false;
                angular.forEach($scope.apps, function(n, i){
                    if(n._id === app._id){
                        had = true;
                    }
                });
                if(had) return;
                app.position = position;
                $scope.apps.push(app);
                $rootScope.$broadcast('updateDesktop');
            }
        }
    ])

    .factory('dragPlaceholder',
    [
        function(){
            //生成占位元素
            return function(el, contain, isFrame){
                var div = angular.element('<div>');
                var rect = el[0].getBoundingClientRect();
                var css = {};

                css.width = rect.right - rect.left +'px';
                css.height = rect.bottom - rect.top +'px';
                css.marginTop = css.marginLeft = '10px';

                div.addClass('drag__temp');
                div.css(css);

                contain.append(div);

                return div;
            }
        }
    ])

    .factory('calcMethods', 
    ['config',
        function(config){
            var cell = config.desktop.appCell;
            var offset = config.desktop.appCell.offset;
            var mainOffset = config.desktop.offset;
            var maxWidth = config.desktop.maxWidth;

            return {
                position: function(item, point, containRect, contain){
                    return {
                        left: Math.floor((contain.scrollLeft + point.x - containRect.left)/(cell.x + offset)) * (cell.x + offset) + mainOffset + 'px',
                        top: Math.floor((contain.scrollTop + point.y - containRect.top)/(cell.y + offset)) * (cell.y + offset) + 'px',
                        width: (item.size && item.size.x ? (item.size.x * (cell.x + offset) - offset) : cell.x) + 'px',
                        height: (item.size && item.size.y ? (item.size.y * (cell.y + offset) -offset ) : cell.y) + 'px'
                    }
                },
                //判断预设位置是否正确
                positionIsRight: function(position, containRect, items, index){
                    var containRect = containRect || {width: maxWidth};
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
                        itemRect.top < 0
//                          ||
//                         itemRect.right > containRect.width
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
                },
                //自动获取可放置的位置
                autoPosition: function(items){
                    var isRight = false;
                    var row = 0;
                    var col = 0;
                    var position = null;

                    while(!isRight){
                        position = {
                            left: mainOffset + col * (offset + cell.x),
                            top: row * (offset + cell.y),
                            width: cell.x,
                            height: cell.y
                        };

                        if(position.left + position.width > maxWidth){
                            col = 0;
                            row++;
                            continue;
                        }

                        isRight = this.positionIsRight(position, null, items);
                        col++;
                    }

                    for(var i in position){
                        position[i] += 'px';
                    }

                    return position;
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
            var eventsMap = {
                web: {
                    down: 'mousedown',
                    up: 'mouseup',
                    move: 'mousemove'
                },
                mobile: {
                    down: 'touchstart',
                    up: 'touchend',
                    move: 'touchmove'
                }
            };
            var device;

            if($window.document.hasOwnProperty("ontouchstart")){
                device = 'mobile';
            }else{
                device = 'web';
            }

            return {
                restrict: 'A',
                compile: function(){
                    return function(scope, element, attrs){
                        var downTime;
                        var clickGap = 100;
                        var timer;

                        element.bind(eventsMap[device].down, elementDown);
                        element.bind(eventsMap[device].up, elementUp);

                        function elementDown(e){
                            e.preventDefault();
                            downTime = new Date().getTime();
                            if(timer){
                                $timeout.cancel(timer);
                            }
                            timer = $timeout(function(){
                                startDrag(e);
                            }, clickGap);
                        }

                        function elementUp(e){
                            var time = new Date().getTime();
                            if(time - downTime <= clickGap){
                                element[0].click();
                            }
                            if(timer){
                                $timeout.cancel(timer);
                            }
                        }

                        function startDrag(e){
                            var positionIsRight = true;
                            var $overlay = angular.element('<div class="resize-overlay"></div>');
                            var $moveContain = angular.element($window.document.body);
                            var $drag = dragPlaceholder(element, $moveContain, true);
                            var $contain = element.parent();
                            var item = $contain.scope().apps[scope.$index];
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
                                left: rect.left - 10 + 'px',
                                top: rect.top - 10 + 'px'
                            });

                            $placeholder.css(position);
                            $placeholder.html('');
                            $placeholder.addClass('drag__placeholder');
                            $contain.append($placeholder);
                            $contain.parent().append($overlay);

                            position = calcMethods.position(item, point, containRect, $contain[0]);
                            positionIsRight = calcMethods.positionIsRight(position, containRect, $contain.scope().apps, scope.$index);

                            //TODO 暂时写法
                            if(!item.size){
                                item.size = {};
                                item.size.showIframe = 'false';
                            }

                            $moveContain.bind(eventsMap[device].move, function(e){
                                if(e.touches){
                                    e.preventDefault();
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
                                }, 16);
                            });

                            $moveContain.bind(eventsMap[device].up, function(e){
                                $moveContain.off(eventsMap[device].move);
                                $moveContain.off(eventsMap[device].up);

                                if(moveTimer){
                                    $timeout.cancel(moveTimer);
                                }

                                $placeholder.remove();
                                $overlay.remove();
                                $drag.remove();

                                if(positionIsRight &&
                                    point.x < containRect.left + containRect.width
//                                      &&
//                                     point.y < containRect.top + containRect.height
                                    ){
                                    item.position = position;
                                    $rootScope.$broadcast('updateDesktop');
                                }else{
                                    $contain.scope().removeApp(scope.$index);
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
});