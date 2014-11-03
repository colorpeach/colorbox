angular.module('index',['ngAnimate', 'ngRoute', 'login', 'myApps', 'addApp', 'appList'])

.config(['$routeProvider',
    function($routeProvider){
        $routeProvider
        .when('/app-list', {
            controller: 'appListCtrl',
            templateUrl: 'app-list.html'
        })
        .when('/login', {
            controller: 'loginCtrl',
            templateUrl: 'login.html'
        })
        .when('/register', {
            controller: 'registerCtrl',
            templateUrl: 'register.html'
        })
        .when('/add/:id', {
            controller: 'addAppCtrl',
            templateUrl: 'add-app.html'
        })
        .when('/add-dialog', {
            controller: 'myAppsCtrl',
            templateUrl: 'dialog.html'
        })
        .when('/my-apps', {
            controller: 'myAppsCtrl',
            templateUrl: 'my-apps.html'
        })
        .when('/', {
            templateUrl: 'index.html'
        })
        .otherwise({
            redirectTo: '/'
        });
    }
])

.controller('desktopCtrl',
['$scope',
    function($scope){
        var addButton = {isButton: true, position: {left: 0, top: 0}};
        $scope.status = {};
        $scope.allowDrag = true;
        $scope.apps = [addButton];

        $scope.switchStatus = function(type){
            if(type === 'add'){
                $scope.status.adding = !$scope.status.adding;
            }
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
            position: function(item, point, containRect){
                return {
                    left: Math.floor((point.x - containRect.left)/cell.x) * cell.x + 'px',
                    top: Math.floor((point.y - containRect.top)/cell.y) * cell.y + 'px',
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
                                position = calcMethods.position(item, point, containRect);
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
                            
                            $drag.remove();
                            $placeholder.remove();
                            $overlay.remove();
                            
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
                            scope[attrs.dragBox].splice(i, 0, item);
                        }else{
                            scope[attrs.dragBox].push(item);
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
]);

angular.bootstrap(document, ['index']);