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

            clone.html('');
            clone.addClass('drag-placeholder');
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

.directive('desktopDrag', 
['utils', '$window', 'dragPlaceholder', '$timeout',
    function(utils, $window, dragPlaceholder, $timeout){
        return {
            restrict: 'A',
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
                        var $placeholder = dragPlaceholder(element, $moveContain);
                        var rect = element[0].getBoundingClientRect();
                        var relative = {};
                        
                        console.log(element.scope());

                        relative.x = e.clientX - rect.left;
                        relative.y = e.clientY - rect.top;

                        $placeholder.css({
                            left: rect.left + 'px',
                            top: rect.top + 'px'
                        });

                        $moveContain.bind('mousemove', function(e){
                            var point = {
                                x: e.clientX,
                                y: e.clientY
                            };

                            $placeholder.css({
                                left: point.x - relative.x + 'px',
                                top: point.y - relative.y + 'px'
                            });
                        });

                        $moveContain.bind('mouseup', function(e){
                            $moveContain.off('mousemove');
                            $moveContain.off('mouseup');
                            var point = {
                                x: e.clientX,
                                y: e.clientY
                            };
                            var $pointElement = angular.element($window.document.elementFromPoint(point.x, point.y));

                            $placeholder.remove();
                            if($pointElement.attr('drag-contain')){
                                $pointElement.append(element);
                            }
                        });
                    }
                }
            }
        }
    }
]);

angular.bootstrap(document, ['index']);