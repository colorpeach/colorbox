define(['js/app'], function(app){
    app

    .value('editorConfig', {
        editor: false,
        console: false,
        route: false,
        source: false,
        preview: false
    })

    .directive('editorConBox',
    ['editorConfig', '$templateCache', 'utils', '$compile',
        function(editorConfig,   $templateCache,   utils,   $compile){
            var tabTemplate = utils.heredoc(function(){/*!
                <span class="editor-tab" ng-repeat="item in tabs" editor-tab ng-class="{active: $parent.current.$index == $index}">
                    {{item.name}}
                    <button ng-if="item.type === 'file'" ng-click="del()">×</button>
                </span>
            */});

            $templateCache.put('editor.editor', utils.heredoc(function(){/*!
                <div editor ng-show="panels[currentPanel].type === 'editor'"></div>
            */}));
            $templateCache.put('editor.console', utils.heredoc(function(){/*!
                <div ng-show="panels[currentPanel].type === 'console'">console</div>
            */}));
            $templateCache.put('editor.route', utils.heredoc(function(){/*!
                <div ng-show="panels[currentPanel].type === 'route'">route</div>
            */}));
            $templateCache.put('editor.source', utils.heredoc(function(){/*!
                <div ng-show="panels[currentPanel].type === 'source'">source</div>
            */}));
            $templateCache.put('editor.preview', utils.heredoc(function(){/*!
                <div ng-show="panels[currentPanel].type === 'preview'">preview</div>
            */}));

            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    scope.config = angular.copy(editorConfig);

                    scope.$watch('currentPanel', function(current){
                        if(angular.isDefined(current)){
                            var type = scope.panels[current].type;

                            switch(type){
                                case 'console':
                                case 'route':
                                case 'source':
                                case 'preview':
                                case 'editor':
                                    if(!scope.config[type]){
                                        var box = angular.element($templateCache.get('editor.' + type));
                                        $compile(box)(scope);
                                        element.append(box);
                                        scope.config[type] = true;
                                    }
                                break;
                            }
                        }
                    });
                }
            };
        }
    ])
});