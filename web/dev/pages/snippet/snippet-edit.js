define(['js/app', 'ace/ace'], function(app, ace){
    app
    .controller('editSnippetCtrl',
    ['$scope', 'snippetsCrud', '$routeParams', '$window', '$sce', '$rootScope', 'storage', 'dialog',
        function($scope,   snippetsCrud,   $routeParams,   $window,   $sce,   $rootScope,   storage,   dialog){
            var dialog = dialog({
                template: 'edit-snippet-dialog',
                scope: $scope,
                maxWidth: '600px',
                onClose: function(){
                    $scope.submit(null, $scope.current.mark, true);
                }
            });
            $scope.data = {
                html: {type: 'html', heads: [""]},
                css: {type: 'css', libs: [], externals: [""]},
                javascript: {type: 'javascript', libs: [], externals: [""]}
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
                    libs: [
                        {key: 'reset', name: 'Reset'},
                        {key: 'normalize', name: 'Normalize'},
                        {key: 'foundation', name: 'Foundation'},
                        {key: 'bootstrap', name: 'Bootstrap'}
                    ],
                    save: save
                },
                javascript: {
                    typeList: [
                        {key: 'javascript', name: 'None'},
//                         {key: 'coffeeScript', name: 'CoffeeScript'}
                    ],
                    libs: [
                        {key: 'angular', name: 'Angular'},
                        {key: 'jquery', name: 'Jquery'}
                    ],
                    save: save
                }
            };
            
            $scope.setLoad({
                loading: true,
                loadMessage: '载入代码'
            });
            snippetsCrud.get($routeParams.id)
            .success(function(data){
                extend($scope.data, data.snippet);
                $scope.previewUrl = $sce.trustAsResourceUrl('/_snippets/preview/' + data.snippet._id);
            });

            $scope.submit = function(e, key, unload){
                e && e.preventDefault();
                var data = {_id: $scope.data._id};

                if(key){
                    data[key] = $scope.data[key];
                }else{
                    data = $scope.data;
                }

                snippetsCrud.save(data)
                .success(function(){
                    !unload && $window.frames[0].location.reload();
                });
            };

            $scope.dialogOpen = function(mark){
                $scope.current = $scope.settings[mark];
                $scope.current.mark = mark;
                dialog.open();
            };
            $scope.dialogClose = function(mark){
                dialog.close();
            };

            $scope.toggleCheckbox = function(mark, value){
                var libs = $scope.data[mark].libs;
                var index = libs.indexOf(value);

                if(index > -1){
                    libs.splice(index, 1);
                }else{
                    libs.push(value);
                }
            };

            function save(e, key){
                $scope.submit(e, key);
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

            function extend(first, second){
                for(var n in second){
                    if(angular.isObject(second[n]) && angular.isObject(first[n])){
                        extend(first[n], second[n]);
                    }else{
                        first[n] = second[n];
                    }
                }
                return first;
            }
        }
    ])

    .directive('snippetEditor', 
    ['$timeout',
        function($timeout){
            return {
                restrict: 'A',
                compile: function(){
                    return function(scope, element, attrs){
                        var editor = ace.edit(element[0]);
                        var userSave = false;
                        var key = attrs.snippetEditor;
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
                                config.save(null, key);
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