define(['js/app', 'ace/ace'], function(app, ace){
    app
    .controller('editSnippetCtrl',
    ['$scope', 'snippetsCrud', '$routeParams', '$window', '$sce', '$rootScope', 'storage', 'dialog',
        function($scope,   snippetsCrud,   $routeParams,   $window,   $sce,   $rootScope,   storage,   dialog){
            $scope.data = {
                html: {},
                css: {},
                javascript: {}
            };
            var dialog = dialog({
                template: 'edit-snippet-dialog',
                scope: $scope,
                width: '600px'
            });
            
            $scope.setLoad({
                loading: true,
                loadMessage: '载入代码'
            });
            snippetsCrud.get($routeParams.id)
            .success(function(data){
                angular.extend($scope.data, data.snippet);
                $scope.previewUrl = $sce.trustAsResourceUrl('/_snippets/preview/' + data.snippet._id);
            });

            $scope.submit = function(e, key){
                e && e.preventDefault();
                var data = {_id: $scope.data._id};

                if(key){
                    data[key] = $scope.data[key];
                }else{
                    data = $scope.data;
                }

                snippetsCrud.save(data)
                .success(function(){
                    $window.frames[0].location.reload();
                });
            };

            $scope.dialogOpen = function(mark){
                $scope.current = $scope.settings[mark];
                $scope.current.mark = mark;
                dialog.open();
            };

            $scope.settings = {
                html: {
                    typeList: [
                        {key: 'html', name: 'None'},
                        {key: 'jade', name: 'Jade'}
                    ],
                    save: save
                },
                css: {
                    typeList: [
                        {key: 'css', name: 'None'},
//                         {key: 'less', name: 'Less'}
                    ],
                    save: save
                },
                javascript: {
                    typeList: [
                        {key: 'javascript', name: 'None'},
//                         {key: 'coffeeScript', name: 'CoffeeScript'}
                    ],
                    save: save
                }
            };

            function save(e){
                $scope.submit(e, this.key);
            }

            $scope.boxs = ['css', 'html', 'js', 'preview'];

            //使用localstorage存储编辑器设置
            storage.bind($scope, 'resizeBox', {
                defaultValue: {
                    resizeBarWidth: 10,
                    items: [
                        {template: 'css-editor', hide: false, name: 'css'},
                        {template: 'html-editor', hide: false, name: 'html'},
                        {template: 'javascript-editor', hide: false, name: 'js'},
                        {template: 'preview', hide: false, name: 'preview'}
                    ],
                    laoout: 1,
                    layouts: {
                        1: {dir: 'v', items: [[{index: 0}, {index: 1}, {index: 2}], [{index: 3}]]},
                        2: {dir: 'h', items: [[{index: 0}, {index: 1}], [{index: 2}, {index: 3}]]},
                        3: {dir: 'h', items: [[{index: 0}, {index: 1}, {index: 2}], [{index: 3}]]},
                        4: {dir: 'v', items: [[{index: 0}, {index: 1}, {index: 2}, {index: 3}]]}
                    }
                }
            });

            storage.bind($scope, 'layout', {
                defaultValue: 1
            });

            $scope.toggle = function(i){
                $rootScope.$broadcast('toggleResizeBox', i);
            };

            $scope.$watch('layout', function(i){
                $rootScope.$broadcast('layoutResizeBox', i);
            });

            $scope.$on('resizeUpdate', function(){
                storage.update('resizeBox');
            });
        }
    ])

    .directive('codeEditor', 
    ['$timeout',
        function($timeout){
            return {
                restrict: 'A',
                compile: function(){
                    return function(scope, element, attrs){
                        var editor = ace.edit(element[0]);
                        var userSave = false;
                        var key = attrs.codeEditor;
                        var config = scope.settings[key];
                        var resizeTimer = 0;

                        editor.setTheme("ace/theme/chrome");

                        editor.setKeyboardHandler();

                        editor.getSession().on('change', function(){
                            scope.data[key].content = editor.getValue();
                        });

                        editor.commands.addCommand({
                            name: 'save',
                            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
                            exec: function(editor) {
                                userSave = true;
                                //TODO
                                scope.data[key].content = editor.getValue();
                                config.save();
                            },
                            readOnly: false
                        });

                        scope.$watch('data.' + key +'.content', function(newValue, oldValue){
                            if(!userSave){
                                if(newValue && newValue !== oldValue){
                                    editor.setValue(newValue);
                                    editor.clearSelection();
                                }
                            }else{
                                userSave = false;
                            }
                        });

                        scope.$watch('data.' + key + '.type', function(newValue){
                            if(newValue){
                                editor.getSession().setMode("ace/mode/" + newValue);
                            }
                        });

                        scope.$on('resizeUpdate', resize);

                        function resize(){
                            if(resizeTimer){
                                resizeTimer = $timeout.cancel(resizeTimer);
                            }
                            $timeout(function(){
                                editor.resize();
                            }, 300);
                        }
                    }
                }
            };
        }
    ]);
});