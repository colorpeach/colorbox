define(['js/app'], function(app){
    app

    .directive('contextMenu',
    ['utils', '$window', '$compile', '$rootScope',
        function(utils,   $window,   $compile,   $rootScope){
            var $body = angular.element($window.document.body);
            var template = utils.heredoc(function(){/*!
                <ul class="context-menu" ng-repeat="(key, menu) in config" ng-show="$parent.shows[key]" ng-style="$parent.css[key]">
                    <li ng-repeat="item in menu" ng-click="exec()" ng-class="{'context-menu-split': item.line}">
                        <span ng-if="item.key" class="context-menu-key">{{item.key && getCommand(item.key)}}</span>
                        <span ng-if="item.mark && mark(item.mark)" class="context-menu-mark"></span>
                        {{item.name}}
                        <span ng-if="item.subMenu" class="context-menu-arrow"></span>
                        <ul ng-if="item.subMenu">
                            <li ng-repeat="item in item.subMenu" ng-click="exec()" ng-class="{'context-menu-split': item.line}">
                                <span ng-if="item.key" class="context-menu-key">{{item.key && getCommand(item.key)}}</span>
                                <span ng-if="item.mark && mark(item.mark)" class="context-menu-mark"></span>{{item.name}}</li>
                        </ul>
                    </li>
                </ul>
            */});

            return {
                restrict: 'A',
                scope: {
                    config: '=contextMenu'
                },
                controller:['$scope',
                    function($scope){
                        $scope.parentScope = $scope.$parent;
                        $scope.shows = {};
                        $scope.css = {};
                        $scope.activeMenu;

                        $scope.getCommand = $scope.$parent.getCommand;

                        $scope.exec = function(){
                            if(this.item.command){
                                $scope.$parent.$eval(this.item.command + '(' + angular.toJson(this.item.params || []).slice(1, -1) + ')');
                            }else{
                                $scope.$parent.execCommand(this.item.key);
                            }
                        };

                        $scope.mark = function(mark){
                            return $scope.$parent.$eval(mark);
                        }

                        this.showMenu = function(show){
                            $scope.activeMenu && ($scope.shows[$scope.activeMenu] = false);
                            $scope.activeMenu = show.menu;
                            $scope.shows[show.menu] = true;
                            $scope.css[show.menu] = calcPosition(show.target, show.point);
                            $body.on('click', hideActiveMenu);
                            $scope.$apply();
                        };

                        function hideActiveMenu(){
                            $scope.shows[$scope.activeMenu] = false;
                            $scope.activeMenu = null;
                            $body.off('click', hideActiveMenu);
                            $scope.$apply();
                        }

                        function calcPosition(target, point){
                            var clientR = $body[0].getBoundingClientRect();
                            var menuR = target[0].getBoundingClientRect();
                            var css = {};

                            if(menuR.left + point.x > clientR.width){
                                css.right = clientR.width - point.x + 'px';
                            }else{
                                css.left = point.x + 'px';
                            }

                            if(menuR.top + point.y > clientR.height){
                                css.bottom = clientR.height - point.y + 'px';
                            }else{
                                css.top = point.y + 'px';
                            }

                            return css;
                        }
                    }
                ],
                link: function(scope, element, attrs){
                    var $wrap = angular.element('<div></div>');
                    
                    $wrap.html(template);
                    $compile($wrap.contents())(scope);
                    $body.append($wrap);

                    scope.$on('$destroy', function(){
                        $wrap.remove();
                        scope = $wrap = null;
                    });
                }
            };
        }
    ])

    .directive('hasContextMenu',
    [
        function(utils){
            return {
                restrict: 'A',
                require: '^contextMenu',
                link: function(scope, element, attrs, contextMenuCtrl){

                    element.on('contextmenu', function(e){
                        e.preventDefault();
                        e.stopPropagation();
                        var point = {
                            x: e.clientX,
                            y: e.clientY
                        } 

                        contextMenuCtrl.showMenu({point: point, menu: attrs.hasContextMenu, target: element});
                    });
                }
            };
        }
    ])

    .directive('triggerContextMenu',
    [
        function(){
            return {
                restrict: 'A',
                require: '^contextMenu',
                link: function(scope, element, attrs, contextMenuCtrl){

                    element.on('click', function(e){
                        e.stopPropagation();
                        var rect = element[0].getBoundingClientRect();
                        var point = {
                            x: rect.right,
                            y: rect.top
                        } 

                        contextMenuCtrl.showMenu({point: point, menu: attrs.triggerContextMenu, target: element});
                    });
                }
            };
        }
    ]);
});