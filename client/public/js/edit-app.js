define(['js/app', 'ace/ace', 'js/dashboard', 'directive/resize'], function(app, ace){
    app
    .controller('editAppCtrl',
    ['$scope', 'appsCrud', '$routeParams', '$window', '$sce', '$rootScope',
        function($scope,   appsCrud,   $routeParams,   $window,   $sce,   $rootScope){
            $scope.setLoad({
                loading: true,
                loadMessage: '载入代码'
            });

            $scope.data = {};
            appsCrud.get($routeParams.id)
            .success(function(data){
                $scope.data = data.app;
                $scope.previewUrl = $sce.trustAsResourceUrl('/_apps/preview/' + data.app._id);
            });

            $scope.submit = function(e, key){
                e && e.preventDefault();
                var data = {_id: $scope.data._id};

                if(key){
                    data[key] = $scope.data[key];
                }else{
                    data = $scope.data;
                }

                appsCrud.save(data)
                .success(function(){
                    $window.frames[0].location.reload();
                });
            };

            $scope.jade = {
                mode: 'jade',
                key: 'jade',
                save: save
            };
            $scope.css = {
                mode: 'css',
                key: 'css',
                save: save
            };
            $scope.javascript = {
                mode: 'javascript',
                key: 'js',
                save: save
            };

            function save(e){
                $scope.submit(e, this.key);
            }

            $scope.boxs = ['css', 'jade', 'js', 'preview'];

            $scope.toggle = function(i){
                $rootScope.$broadcast('toggleResizeBox', i);
            };

            $scope.resizeBox = {
                resizeBarWidth: 10,
                items: [
                    {template: 'css-editor', hide: false},
                    {template: 'html-editor', hide: false},
                    {template: 'javascript-editor', hide: false},
                    {template: 'preview', hide: false}
                ],
                laoout: 1,
                layouts: {
                    1: {dir: 'v', items: [[{index: 0}, {index: 1}, {index: 2}], [{index: 3}]]},
                    2: {dir: 'h', items: [[{index: 0}, {index: 1}], [{index: 2}, {index: 3}]]}
                }
            };

            $scope.layout = 1;
            $scope.$watch('layout', function(i){
                $rootScope.$broadcast('layoutResizeBox', i);
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
                        var config = scope[attrs.codeEditor];
                        var resizeTimer = 0;

                        editor.setTheme("ace/theme/chrome");
                        editor.getSession().setMode("ace/mode/" + config.mode);

                        editor.setKeyboardHandler();

                        editor.getSession().on('change', function(){
                            scope.data[config.key] = editor.getValue();
                        });

                        editor.commands.addCommand({
                            name: 'save',
                            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
                            exec: function(editor) {
                                userSave = true;
                                //TODO
                                scope.data[config.key] = editor.getValue();
                                config.save();
                            },
                            readOnly: false
                        });

                        scope.$watch('data.' + config.key, function(newValue, oldValue){
                            if(!userSave){
                                if(newValue && newValue !== oldValue){
                                    editor.setValue(newValue);
                                    editor.clearSelection();
                                }
                            }else{
                                userSave = false;
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