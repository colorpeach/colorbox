define(['js/app'], function(app){
    app

    .directive('contextMenu',
    ['utils', '$window', '$compile',
        function(utils,   $window,   $compile){
            var $body = angular.element($window.document.body);
            var template = utils.heredoc(function(){/*!
                <ul class="context-menu" ng-repeat="(key, menu) in config" ng-show="$parent.shows[key]" ng-style="$parent.css[key]">
                    <li ng-repeat="item in menu" ng-click="parentScope.$eval(item.command)">{{item.name}}</li>
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

                        this.showMenu = function(show){
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
                    var $contextMenu = angular.element(template);
                    $compile($contextMenu)(scope);
                    $body.append($contextMenu);
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
    ]);
});