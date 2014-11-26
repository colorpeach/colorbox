define(['js/app', 'ace/ace'], function(app, ace){
    app

    .value('editorNavConfig', {
        editorNav: [
            {
                name: '文件', 
                subNav: [
                    {name: '新建', command: 'addFile', key: 'Ctrl+N'}
                ]
            },
            {
                name: '视图',
                subNav: [
                    {
                        name: '布局',
                        subNav: [
                            {
                                name: '布局1',
                                mark: 'layoutConfig.layout === 0',
                                command: 'switchLayout',
                                params: [0]
                            },
                            {
                                name: '布局2',
                                mark: 'layoutConfig.layout === 1',
                                command: 'switchLayout',
                                params: [1]
                            }
                        ]
                    },
                    {
                        name: '窗口',
                        subNav: [
                            {
                                name: '数据源',
                                mark: 'panelTabs.indexOf("source") > -1',
                                command: 'togglePanel',
                                params: ['source']
                            },
                            {
                                name: '路由',
                                mark: 'panelTabs.indexOf("route") > -1',
                                command: 'togglePanel',
                                params: ['route']
                            },
                            {
                                name: '预览',
                                mark: 'panelTabs.indexOf("preview") > -1',
                                command: 'togglePanel',
                                params: ['preview']
                            }
                        ]
                    }
                ]
            }
        ],
        panels: [
            {name: '数据源', type: 'source'},
            {name: '路由', type: 'route'},
            {name: '预览', type: 'preview'}
        ]
    })

    .factory('layoutConfig',
    [
        function(){
            return {
                resizeBarWidth: 10,
                items: [
                    {template: 'editor-tree', hide: false},
                    {template: 'editor-main', hide: false},
                    {template: 'editor-assist', hide: false}
                ],
                layout: 0,
                layouts: {
                    0: {dir: 'h', groupReals: [20, 80], items: [[{index: 0}], [{index: 1, real: 60}, {index: 2, real: 40}]]},
                    1: {dir: 'h', groupReals: [20, 40, 40], items: [[{index: 0}], [{index: 1}], [{index: 2}]]}
                }
            };
        }
    ])

    .factory('appProMethod',
    ['xtree.export', 'xtree.config', '$rootScope', 'appProCrud',
        function(tree,   treeConfig,   $rootScope,   appProCrud){
            return function($scope){

                treeConfig.ondblclick = function(e, node){
                    if(node.isParent || node.children) return;
                    $scope.openFile(node.unique);
                };

                treeConfig.onedit = function(e, node){
                    var data = {
                        _id: $scope._id,
                        id: node.id,
                        name: node.name,
                        updateKey: 'name'
                    };
                    appProCrud.saveFile(data)
                    .success(function(){

                    })
                };

                $scope.$on('editorSaving', function(e, content){
                    var data = {
                        _id: $scope._id,
                        id: $scope.currentFile.id,
                        content: content,
                        updateKey: 'content'
                    };
                    appProCrud.saveFile(data)
                    .success(function(){
                        $scope.currentFile.content = content;
                        $scope.$broadcast('editorSaved');
                    });
                });

                $scope.openFile =  function(unique){
                    if($scope.tabs.indexOf(unique) < 0){
                        $scope.currentTab = unique;
                        $scope.tabs.push(unique);
                    }else{
                        $scope.currentTab = unique;
                    }
                };

                $scope.addFile = function(){
                    var node = {type: 'file'};
                    tree.addNode(node);
                    appProCrud.addFile(node)
                    .success(function(data){
                        node.id = data.id;
                        $scope.openFile(node.unique);
                    });
                };

                $scope.delFile = function(){
                    var node = tree.getSelected();
                    var tabIndex;
                    if(node){
                        if(!confirm('确认删除文件?')) return;
                        appProCrud.delFile(node.id, $scope._id)
                        .success(function(){
                            tree.deleteSelected();
                            if((tabIndex = $scope.tabs.indexOf(node.unique)) > -1){
                                $scope.tabs.splice(tabIndex, 1);
                                node.unique === $scope.currentTab && fixCurrent($scope.tabs, 'currentTab', tabIndex);
                            }
                        });
                    }
                };

                //关闭tab
                $scope.closeTab = function(type, index){
                    var tabs = $scope[type];
                    var current = type === 'tabs' ? 'currentTab' : 'currentPanel';
                    
                    if(type === 'tabs'){
                        //如果关闭的是文件
                        var file = $scope.getNode({unique: $scope.currentTab});
                        if(file.isChange){
                            if(!confirm('文件还未保存，确认关闭?')){
                                return;
                            }else{
                                var session = file.editSession;
                                session.getUndoManager().reset();
                                session.getDocument().setValue(file.content);
                                file.isChange = false;
                            }
                        }
                    }
                    tabs.splice(index, 1);
                    fixCurrent(tabs, current, index);
                };

                $scope.getNode = function(data){
                    if(!tree.getScope()) return;
                    return tree.getNode(data);
                };

                $scope.$watch('currentTab', function(val){
                    if(val == undefined){
                        $scope.currentFile = null;
                    }else{
                        $scope.currentFile = $scope.getNode({unique: $scope.currentTab});
                    }
                });

                $scope.togglePanel = function(type){
                    var index = $scope.panelTabs.indexOf(type);
                    if(index > -1){
                        $scope.closeTab('panelTabs', index);
                        fixCurrent($scope.panelTabs, 'currentPanel', index);
                    }else{
                        $scope.panelTabs.push(type);
                        $scope.currentPanel = type;
                    }
                };

                $scope.getPanel = function(type){
                    for(var i=0, l=$scope.panels.length; i<l; i++){
                        if($scope.panels[i].type === type){
                            return $scope.panels[i];
                        }
                    }
                };

                $scope.switchLayout = function(i){
                    $scope.layoutConfig.layout = i;
                    $rootScope.$broadcast('layoutResizeBox', i);
                };

                function fixCurrent(tabs, current, index){
                    if(!tabs.length){
                        $scope[current] = null;
                    }else if(index >= tabs.length){
                        $scope[current] = tabs[tabs.length - 1];
                    }else{
                        $scope[current] = tabs[index];
                    }
                }
            }
        }
    ])

    .controller('editAppProCtrl',
    ['$scope', 'editorNavConfig', 'layoutConfig', '$rootScope', 'appProCrud', '$routeParams', 'appProMethod',
        function($scope,   editorNavConfig,   layoutConfig,   $rootScope,   appProCrud,   $routeParams,   appProMethod){
            $scope.editorNav = editorNavConfig.editorNav;
            $scope.layoutConfig = layoutConfig;
            $scope.panels = editorNavConfig.panels;
            $scope.files = [];
            $scope.tabs = [];
            $scope.panelTabs = ['source', 'route', 'preview'];
            $scope.currentPanel = $scope.panelTabs[0];
            $scope._id = $routeParams.id;

            appProMethod($scope);

            $scope.setLoad({
                loading: true,
                loadMessage: '载入应用'
            });
            appProCrud.get($routeParams.id)
            .success(function(data){
                $scope.files = data.app.files;
                $scope.app = data.app;
            });
            
            //隐藏显示区块
            $scope.toggleBlock = function(i){
                $rootScope.$broadcast('toggleResizeBox', i);
            };
        }
    ])

    .directive('editor',
    ['$timeout',
        function($timeout){
            var modes = {
                'js': 'javascript',
                'html': 'html',
                'css': 'css'
            };

            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    var resizeTimer;
//                     ace.require("ace/ext/language_tools");
                    var editor = ace.edit(element[0]);
//                     editor.setOptions({
//                         enableBasicAutocompletion: true
//                     });

                    scope.editor = editor;

                    editor.on('input', function(){
                        if(!scope[attrs.editor]) return;
                        if(editor.session.getUndoManager().isClean()){
                            scope[attrs.editor].isChange = false;
                        }else{
                            scope[attrs.editor].isChange = true;
                        }
                        scope.$apply();
                    });

                    editor.commands.addCommand({
                        name: 'save',
                        bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
                        exec: function(editor) {
                            if(scope[attrs.editor].isChange){
                                scope.$emit('editorSaving', editor.getValue());
                            }
                        },
                        readOnly: false
                    });

                    scope.$on('editorSaved', function(){
                        editor.session.getUndoManager().markClean();
                        scope[attrs.editor].isChange = false;
                    });

                    scope.$watch(attrs.editor, function(file){
                        if(file){
                            if(!file.editSession){
                                file.editSession = ace.createEditSession(file.content || '');
                            }
                            editor.setSession(file.editSession);
                            editor.focus();
                        }else{

                        }
                    });

                    scope.$watch(attrs.editor + '.name', function(fileName){
                        if(fileName){
                            var suffix = fileName.split('.').pop();
                            if(suffix in modes){
                                editor.getSession().setMode("ace/mode/" + modes[suffix]);
                            }else{
                                editor.getSession().setMode("ace/mode/text");
                            }
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
            };
        }
    ]);
});