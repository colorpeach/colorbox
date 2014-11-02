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
        $scope.status = {};
        $scope.allowDrag = true;
        $scope.apps = [];

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

//             clone.html('');
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

.factory('calcPosition', 
[
    function(){
        var cell = {
            x: 120,
            y: 120
        };
        
        return function(point, containRect){
            return {
                left: Math.floor((point.x - containRect.left)/cell.x) * cell.x + 'px',
                top: Math.floor((point.y - containRect.top)/cell.y) * cell.y + 'px'
            };
        };
    }
])

.directive('dragItem', 
['utils', '$window', 'dragPlaceholder', '$timeout', '$rootScope', 'calcPosition',
    function(utils, $window, dragPlaceholder, $timeout, $rootScope, calcPosition){
        return {
            restrict: 'A',
//             require: ['dragBox'],
            compile: function(){
                return function(scope, element, attrs){
                    var timer;
                    
                    element.find('a').bind('click', function(e){
                        if(!scope.allowDrag) return;
                        e.preventDefault();
                    });

                    element.bind('mousedown', function(e){
                        if(!scope.allowDrag) return;
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

                        $moveContain.bind('mousemove', function(e){
                            var point = {
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
                                position = calcPosition(point, containRect);
                                $placeholder.css(position);
                            }, 100);
                        });

                        $moveContain.bind('mouseup', function(e){
                            $moveContain.off('mousemove');
                            $moveContain.off('mouseup');
                            if(moveTimer){
                                $timeout.cancel(moveTimer);
                            }
                            var point = {
                                x: e.clientX,
                                y: e.clientY
                            };
                            var $pointElement = angular.element($window.document.elementFromPoint(point.x, point.y));
                            
                            $drag.remove();
                            $placeholder.remove();
                            
                            if($pointElement.attr('drag-contain')){
                                var item = scope.remove(scope.$index);
                                item.position = calcPosition(point, containRect);
                                $pointElement.scope().add(item);
                                $rootScope.$apply();
                            }
                            
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