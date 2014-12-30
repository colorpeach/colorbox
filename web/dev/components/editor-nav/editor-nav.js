define(['js/app'], function(app){
    app

    .directive('editorNav',
    ['$compile', 'utils',
        function($compile, utils){
            var template = utils.heredoc(function(){/*!
                <span class="editor__nav-item" ng-repeat="item in nav" editor-nav-item ng-class="{active: $parent.active == $index}">
                    {{item.name}}
                    <ul ng-show="$parent.active == $index">
                        <li ng-repeat="sub in item.subNav" ng-click="exec()" ng-class="{'editor__nav-split': sub.line}">
                            <span ng-if="sub.key" class="editor__nav-key">{{sub.key && getCommand(sub.key)}}</span>
                            <span ng-if="sub.mark && mark(sub.mark)" class="editor__nav-mark"></span>
                            {{sub.name}}
                            <span ng-if="sub.subNav" class="editor__nav-arrow"></span>
                            <ul ng-if="sub.subNav">
                                <li ng-repeat="sub in sub.subNav" ng-click="exec()" ng-class="{'editor__nav-split': sub.line}">
                                    <span ng-if="sub.key" class="editor__nav-key">{{sub.key && getCommand(sub.key)}}</span>
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

                    scope.getCommand = scope.$parent.getCommand;

                    scope.exec = function(){
                        if(this.sub.command){
                            scope.$parent.$eval(this.sub.command + '(' + angular.toJson(this.sub.params || []).slice(1, -1) + ')');
                        }else{
                            scope.$parent.execCommand(this.sub.key);
                        }
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
            var body = $window.document.body;
            var $body = angular.element(body);
            var viewport = {width: body.clientWidth, height: body.clientHeight};
            
            //获取视口宽高
            angular.element($window).on('resize', function(){
                viewport.width = body.clientWidth;
                viewport.height = body.clientHeight;
            });

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

                    element.bind('mouseover', function(e){
                        var target = e.target;

                        if(angular.isDefined($parent.active) && $parent.active !== scope.index){
                            safeApply.call($parent, function(){
                                $parent.active = scope.$index;
                            });
                        }

                        if(target.tagName === 'LI' || (target.parentNode.tagName === 'LI' && (target = target.parentNode))){
                            var ul = findUl(target);
                            if(!ul) return;
                            var scrollHeight = ul.scrollHeight;
                            var rect = target.getBoundingClientRect();
                            var css = {
                                height: 'auto',
                                top: '-6px'
                            };

                            if(scrollHeight > viewport.height){
                                css.height = viewport.height + 'px';
                                css.overflowY = 'auto';
                                css.overflowX = 'hidden';
                                css.top = - rect.top + 'px';
                            }else if(rect.top + scrollHeight > viewport.height){
                                css.top = viewport.height - scrollHeight - rect.top - 5 + 'px';
                            }

                            angular.element(ul).css(css);
                        }
                    });

                    function findUl(li){
                        var $childrens = angular.element(li).children();
                        var index = 0;

                        while($childrens[index]){
                            if($childrens[index].tagName === 'UL')
                                return $childrens[index];
                            else
                                index++;
                        }
                    }

                    function hideActive(){
                        if(angular.isDefined($parent.active)){
                            safeApply.call($parent, function(){
                                $parent.active = void 0;
                            });
                            $body.unbind('click', hideActive);
                        }
                    }
                }
            };
        }
    ]);
});