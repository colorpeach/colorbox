define(['js/app'], function(app){
    app

    .directive('editorNav',
    ['$compile', 'utils',
        function($compile, utils){
            var template = utils.heredoc(function(){/*!
                <span class="editor-nav-item" ng-repeat="item in nav" editor-nav-item ng-class="{active: $parent.active == $index}">
                    {{item.name}}
                    <ul ng-show="$parent.active == $index">
                        <li ng-repeat="sub in item.subNav">{{sub.name}}</li>
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
                }
            };
        }
    ])

    .directive('editorNavItem',
    ['$window',
        function($window){
            var $body = angular.element($window.document.body);

            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    var $parent = scope.$parent;

                    element.bind('click', function(e){
                        if(!angular.isDefined($parent.active)){
                            $parent.$apply(function(){
                                $parent.active = scope.$index;
                            });
                            e.stopPropagation();
                            $body.bind('click', hideActive);
                        }
                    });

                    element.bind('mouseover', function(){
                        if(angular.isDefined($parent.active)){
                            $parent.$apply(function(){
                                $parent.active = scope.$index;
                            });
                        }
                    });

                    function hideActive(){
                        if(angular.isDefined($parent.active)){
                            $parent.$apply(function(){
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