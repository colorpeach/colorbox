define(['js/app'], function(app){
    app

    .value('editorConfig', {
        editor: false,
        console: false,
        route: false,
        source: false,
        preview: false
    })

    .directive('editorBox',
    ['editorConfig', '$templateCache', 'utils', '$compile',
        function(editorConfig,   $templateCache,   utils,   $compile){
            var tabTemplate = utils.heredoc(function(){/*!
                <span class="editor-tab" ng-repeat="item in tabs" editor-tab ng-class="{active: $parent.current.$index == $index}">
                    {{item.name}}
                    <button ng-if="item.type === 'file'" ng-click="del()">×</button>
                </span>
            */});

            $templateCache.put('editor.editor', utils.heredoc(function(){/*!
                <div editor ng-show="current.type === 'editor'"></div>
            */}));
            $templateCache.put('editor.console', utils.heredoc(function(){/*!
                <div ng-show="current.type === 'console'">console</div>
            */}));
            $templateCache.put('editor.route', utils.heredoc(function(){/*!
                <div ng-show="current.type === 'route'">route</div>
            */}));
            $templateCache.put('editor.source', utils.heredoc(function(){/*!
                <div ng-show="current.type === 'source'">source</div>
            */}));
            $templateCache.put('editor.preview', utils.heredoc(function(){/*!
                <div ng-show="current.type === 'preview'">preview</div>
            */}));

            return {
                restrict: 'A',
                scope: {
                    tabs: '=editorBox'
                },
                link: function(scope, element, attrs){
                    var $tabs =  angular.element(tabTemplate);
                    var $con = element.children().eq(1);

                    $compile($tabs)(scope);
                    element.children().eq(0).append($tabs);

                    scope.config = angular.copy(editorConfig);

                    if(scope.tabs.length){
                        scope.current = scope.tabs[0];
                        scope.current.$index = 0;
                    }

                    scope.$watch('current', function(current){
                        if(current){
                            var type = current.type;

                            switch(type){
                                case 'console':
                                case 'route':
                                case 'source':
                                case 'preview':
                                case 'editor':
                                    if(!scope.config[type]){
                                        var box = angular.element($templateCache.get('editor.' + type));
                                        $compile(box)(scope);
                                        $con.append(box);
                                    }
                                break;
                            }
                        }
                    });
                }
            };
        }
    ])

    .directive('editorTab',
    ['$rootScope',
        function($rootScope){
            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    var $parent = scope.$parent;

                    scope.select = function(){
                        $parent.$apply(function(){
                            $parent.current = scope;
                        });
                    };

                    scope.del = function(){
                        $parent.tabs.splice(scope.$index);
                    };

                    element.bind('click', scope.select);
                }
            };
        }
    ])
});