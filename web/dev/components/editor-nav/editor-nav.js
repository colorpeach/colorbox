define(['js/app'], function(app){
    app

    .directive('editorNav',
    ['$compile', 'utils',
        function($compile, utils){
            var template = utils.heredoc(function(){/*!
                <span class="editor__nav-item" ng-repeat="item in nav" editor-nav-item ng-class="{active: $parent.active == $index}">
                    {{item.name}}
                    <ul ng-show="$parent.active == $index">
                        <li ng-repeat="sub in item.subNav" ng-click="sub.command && exec(sub.command, sub.params)">
                            <span ng-if="sub.key" class="right">{{sub.key}}</span>
                            {{sub.name}}
                            <span ng-if="sub.subNav" class="editor__nav-arrow"></span>
                            <ul ng-if="sub.subNav">
                                <li ng-repeat="sub in sub.subNav" ng-click="sub.command && exec(sub.command, sub.params)">
                                    <span ng-if="sub.mark && mark(sub.mark)" class="editor__nav-mark"></span>{{sub.name}}</li>
                            </ul>
                        </li>
                    </ul>
                </span>
            */});

            return {
                restrict: 'A',
                scope: {
                    nav: '=editorNav'
                },
                link:  function(scope, element, attrs){
                    var nav = angular.element(template);

                    $compile(nav)(scope);
                    element.append(nav);

                    scope.exec = function(command, params){
                        scope.$parent[command].apply(scope.$parent, params);
                    };

                    scope.mark = function(mark){
                        return scope.$parent.$eval(mark);
                    }
                }
            };
        }
    ])

    .directive('editorNavItem',
    ['$window', 'safeApply',
        function($window,   safeApply){
            var $body = angular.element($window.document.body);

            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    var $parent = scope.$parent;

                    element.bind('click', function(e){
                        if(!angular.isDefined($parent.active)){
                            safeApply.call($parent, function(){
                                $parent.active = scope.$index;
                            });
                            e.stopPropagation();
                            $body.bind('click', hideActive);
                        }
                    });

                    element.bind('mouseover', function(){
                        if(angular.isDefined($parent.active)){
                            safeApply.call($parent, function(){
                                $parent.active = scope.$index;
                            });
                        }
                    });

                    function hideActive(){
                        if(angular.isDefined($parent.active)){
                            safeApply.call($parent, function(){
                                $parent.active = undefined;
                            });
                            $body.unbind('click', hideActive);
                        }
                    }
                }
            };
        }
    ]);
});