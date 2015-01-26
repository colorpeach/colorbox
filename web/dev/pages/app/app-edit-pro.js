define(['js/app', 'ace/ace'], function(app, ace){
    
    app

    .value('editorNavConfig', {
        editorNav: [
            {
                name: '文件', 
                subNav: [
                    {name: '新建', command: 'addFile', key: 'Ctrl-N'},
                    {name: '打开', command: ''},
                    {
                        name: '最近打开',
                        subNav: []
                    },
                    {name: '保存', command: '', line: true, key: 'Ctrl-S'},
                    {name: '保存所有', command: ''},
                    {name: '关闭', command: '', line: true, key: 'Alt-W'},
                    {name: '关闭所有', command: ''}
                ]
            },
            {
                name: '编辑', 
                subNav: [
                    {name: '撤销', key: 'undo'},
                    {name: '恢复', command: 'editor.redo', key: 'redo'},
                    {name: '剪切', key: 'Ctrl-X', line: true},
                    {name: '复制', key: 'Ctrl-C'},
                    {name: '粘贴', key: 'Ctrl-V'},
                    {
                        name: '选择',
                        line: true,
                        subNav: [
                            {name: '全选', key: 'selectall'},
                            {name: '选择选中行尾', key: 'splitIntoLines'},
                            {name: '单选', key: 'removeline'},
                            {name: '多行选择', line: true},
                            {name: '右选', key: 'selectwordright', line: true},
                            {name: '左选', key: 'selectwordleft'},
                            {name: '选到行尾', key: 'selecttolineend', line: true},
                            {name: '选到行首', key: 'selecttolinestart'},
                            {name: '选到文件底', key: 'selecttoend', line: true},
                            {name: '选到文件顶', key: 'selecttostart'}
                        ]
                    },
                    {
                        name: '行操作',
                        subNav: [
                            {name: '缩进', key: 'indent'},
                            {name: '退格', key: 'outdent'},
                            {name: '上移行', key: 'movelinesup'},
                            {name: '下移行', key: 'movelinesdown'},
                            {name: '复制行上移', key: 'copylinesup', line: true},
                            {name: '复制行下移', key: 'copylinesdown'},
                            {name: '删除行', key: 'removeline', line: true},
                            {name: '删除到行尾', key: 'removetolineend'},
                            {name: '删除到行首', key: 'removetolinestart'}
                        ]
                    },
                    {
                        name: '文本',
                        subNav: [
                            {name: '对齐', key: 'alignCursors'},
                            {name: '转为大写', key: 'touppercase', line: true},
                            {name: '转为小写', key: 'tolowercase'}
                        ]
                    },
                    {
                        name: '注释',
                        subNav: [
                            {name: '添加/删除行注释', key: 'togglecomment'},
                            {name: '添加/删除块注释', key: 'toggleBlockComment'}
                        ]
                    },
                    {
                        name: '代码折叠',
                        subNav: [
                            {name: '折叠',        key: 'fold'},
                            {name: '取消折叠',    key: 'unfold'},
                            {name: '折叠所有',    key: 'foldall', line: true},
                            {name: '取消折叠所有', key: 'unfoldall'}
                        ]
                    },
                    {
                        name: '代码格式化',
                        subNav: [
                            {name: 'Javascript', command: ''}
                        ]
                    }
                ]
            },
            {
                name: '查找', 
                subNav: [
                    {name: '查找',      key: 'find'},
                    {name: '查找下一个', key: 'findnext'},
                    {name: '查找上一个', key: 'findprevious'},
                    {name: '替换',      key: 'replace', line: true},
                    {name: '替换上一个', command: '', key: ''},
                    {name: '替换下一个', command: '', key: ''},
                    {name: '替换所有',   command: '', key: ''},
                    {name: '文件中查找', command: '', key: '', line: true}
                ]
            },
            {
                name: '视图',
                subNav: [
                    {
                        name: '布局',
                        subNav: [
                            {name: '布局1', mark: 'layoutConfig.layout === 0', command: 'switchLayout', params: [0]},
                            {name: '布局2', mark: 'layoutConfig.layout === 1', command: 'switchLayout', params: [1]}
                        ]
                    },
                    {name: '数据源', mark: 'panelTabs.indexOf("source") > -1',  command: 'togglePanel', params: ['source'], line: true},
                    {name: '路由',   mark: 'panelTabs.indexOf("route") > -1',   command: 'togglePanel', params: ['route']},
                    {name: '预览',   mark: 'panelTabs.indexOf("preview") > -1', command: 'togglePanel', params: ['preview']},
                    {
                        name: '字体',
                        line: true,
                        subNav: [
                            {name: '减小字体', command: '', key: ''},
                            {name: '增大字体', command: '', key: ''}
                        ]
                    },
                    {name: '语言'},
                    {name: '编辑器主题'}
                ]
            },
            {
                name: '跳到',
                subNav: [
                    {name: '跳到行', key: 'gotoline'},
                    {name: '下一个错误', key: 'goToNextError', line: true},
                    {name: '上一个错误', key: 'goToPreviousError'},
                    {name: '右边界', key: 'gotowordright', line: true},
                    {name: '左边界', key: 'gotowordleft'},
                ]
            },
            {
                name: '帮助',
                subNav: [
                    {name: '快捷键'}
                ]
            }
        ],
        panels: [
            {name: '数据源', type: 'source',   template: 'editor-source'},
            {name: '路由',   type: 'route',   template: 'editor-route'},
            {name: '预览',   type: 'preview', template: 'editor-preview'}
        ],
        menuConfig: {
            main: [
                {name: '打开', command: 'openFile'},
                {name: '新建文件', command: 'addFile', line: true},
                {name: '新建文件夹', command: 'addDir'},
                {name: '重命名', line: true},
                {name: '删除', command: 'delFile', line: true}
            ]
        },
        editorAssist: {
            settings: [
                {name: '显示行号', command: 'editor.renderer.setShowGutter(!editor.renderer.getShowGutter())', mark: 'editor.renderer.getShowGutter()'},
                {name: '显示符号', command: 'editor.renderer.setShowInvisibles(!editor.renderer.getShowInvisibles())', mark: 'editor.renderer.getShowInvisibles()'},
                {name: '显示打印边界', command: 'editor.renderer.setShowPrintMargin(!editor.renderer.getShowPrintMargin())', mark: 'editor.renderer.getShowPrintMargin()'},
                {name: '字体', command: '', line: true}
            ],
            syntax: [
                {name: 'javascript'},
                {name: 'html'}
            ],
            tab: [
                {name: '使用空格代替制表符', command: 'editor.session.setUseSoftTabs(!editor.session.getUseSoftTabs())', mark: 'editor.session.getUseSoftTabs()'},
                {name: '2', command: 'editor.session.setTabSize', params: [2], mark: 'editor.session.getTabSize() === 2', line: true},
                {name: '4', command: 'editor.session.setTabSize', params: [4], mark: 'editor.session.getTabSize() === 4'},
                {name: '6', command: 'editor.session.setTabSize', params: [6], mark: 'editor.session.getTabSize() === 6'},
                {name: '8', command: 'editor.session.setTabSize', params: [8], mark: 'editor.session.getTabSize() === 8'},
                {name: '转化空格为制表符', command: '', params: [8], line: true},
                {name: '转化制表符为空格', command: '', params: [8]}
            ]
        }
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

    .factory('generateThemeNavs',
    ['config',
        function(config){
            return config.editorThemes.map(function(n, i){
                return {
                    name: n,
                    params: ['ace/theme/' + n],
                    command: 'editor.setTheme',
                    mark: 'editor.renderer.$theme === ' + angular.toJson('ace-' + n.replace(/_/g, '-'))
                };
            });
        }
    ])

    .factory('appProMethod',
    ['xtree.export', 'xtree.config', '$rootScope', 'data::store', '$sce', 'safeApply',
        function(tree,   treeConfig,   $rootScope,   store,   $sce,   safeApply){
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
                        url: node.url,
                        updateKeys: ['name', 'url']
                    };
                    store('app', 'saveFile', data)
                    .success(function(){

                    })
                };

                $scope.$on('editorSaving', function(e, content){
                    var data = {
                        _id: $scope._id,
                        id: $scope.currentFile.id,
                        content: content,
                        updateKeys: ['content']
                    };
                    store('app', 'saveFile', data)
                    .success(function(){
                        $scope.currentFile.content = content;
                        $scope.$broadcast('editorSaved');
                    });
                });

                $scope.openFile =  function(unique){
                    if(!unique){
                        var node = tree.getSelected();
                        if(node){
                            unique = node.unique;
                        }else{
                            return;
                        }
                    }
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
                    var data = angular.copy(node);
                    data._id = $scope._id;
                    store('app', 'addFile', data)
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
                        store('app', 'delFile', {id: node.id, _id: $scope._id})
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
                $scope.closeTab = function(type, item){
                    var tabs = $scope[type];
                    var current = type === 'tabs' ? 'currentTab' : 'currentPanel';
                    var index = tabs.indexOf(item);
                    
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
                    if($scope[current] === item){
                        fixCurrent(tabs, current, index);
                    }
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
                        $scope.closeTab('panelTabs', type);
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

                $scope.$watch('app.entrance', function(entrance){
                    if($scope.app){
                        var prefix = ['/application/', $scope.app.user, '/', $scope.app.name];
                        $scope.url = $sce.trustAsResourceUrl(prefix.join('') + entrance);
                    }
                });

                $scope.reloadIframe = function(){
                    $scope.$broadcast('editorIframeStartLoad');
                    $scope.iframeLoaded = false;
                };

                $scope.$on('editorIframeLoadSuccess', function(){
                    safeApply.call($scope, function(){
                        $scope.iframeLoaded = true;
                    });
                });
            }
        }
    ])

    .controller('editAppProCtrl',
    ['$scope', 'editorNavConfig', 'layoutConfig', '$rootScope', 'data::store', '$routeParams', 'appProMethod', 'generateThemeNavs',
        function($scope,   editorNavConfig,   layoutConfig,   $rootScope,   store,   $routeParams,   appProMethod,   generateThemeNavs){
            editorNavConfig.editorNav[3].subNav[6].subNav = generateThemeNavs;
            $scope.editorNav = editorNavConfig.editorNav;
            $scope.layoutConfig = layoutConfig;
            $scope.menuConfig = editorNavConfig.menuConfig;
            $scope.editorAssist = editorNavConfig.editorAssist;
            $scope.panels = editorNavConfig.panels;
            $scope.files = [];
            $scope.tabs = [];
            $scope.panelTabs = ['route', 'source', 'preview'];
            $scope.currentPanel = $scope.panelTabs[0];
            $scope._id = $routeParams.id;

            appProMethod($scope);

            $scope.setLoad({
                loading: true,
                loadMessage: '载入应用'
            });
            store('app', 'get', $routeParams.id)
            .success(function(data){
                $scope.files = data.app.files;
                $scope.app = data.app;

                $scope.$watch('app.entrance', function(entrance){
                    entrance && store('app', 'save', {_id: $scope._id, entrance: entrance});
                });
            });
            
            //隐藏显示区块
            $scope.toggleBlock = function(i){
                $rootScope.$broadcast('toggleResizeBox', i);
            };

            $scope.getCommand = function(name){
                var type = 'win';
                if($scope.editor){
                    return $scope.$eval('editor.commands.commands["' + name + '"].bindKey["' + type + '"]') || name;
                }
            };

            $scope.execCommand = function(command){
                $scope.$eval('editor.execCommand("' + command + '")');
            };
        }
    ])

    .controller('editorSourceCtrl',
    ['$scope', 'DataList', 'data::store',
        function($scope,   DataList,   store){
            var tableColumns = [];

            $scope.typeList = [
                'Array',
                'Date',
                'Number',
                'Object',
                'String',
                'Defined'
            ];

            $scope.sourceTable = new DataList({
                columns: 'Array',
                name: 'String'
            });

            $scope.addTable = function(){
                var tableName = ($scope.tableName || '').trim();

                $scope.errorMessage = '';

                if(!tableName){
                    $scope.errorMessage = '请填写表名';
                    return;
                }

                if(!tableName.match(/[a-zA-z_]{4,20}/)){
                    $scope.errorMessage = '表名格式不正确，表名只允许字母和下划线，长度在4~20之间'
                    return;
                }

                $scope.errorMessage = '正在检测表名';
                store('app', 'checkTableName', tableName)
                .success(function(data){
                    var columns = new DataList({
                        name: 'String',
                        type: 'String'
                    });
                    tableColumns.push(columns);
                    $scope.sourceTable.add({
                        columns: columns.list,
                        name: tableName,
                        appName: $scope.$parent.app.name
                    });
                    $scope.errorMessage = 
                    $scope.tableName = '';
                })
                .error(function(data){
                    $scope.errorMessage = data.errorMessage[0];
                });
            };

            $scope.removeTable = function($index){
                $scope.sourceTable.remove($index);
                tableColumns.splice($index, 1);
            };

            $scope.addColumn = function(tableIndex){
                tableColumns[tableIndex].add({
                    name: '',
                    type: ''
                });
            };

            $scope.removeColumn = function(tableIndex, $index){
                tableColumns[tableIndex].remove($index);
            };

            $scope.save = function(){
                var data = {_id: $scope.$parent._id};

                data.table = generateTableData($scope.sourceTable.list);

                store('app', 'save', data)
                .success(function(){
                    
                });
            };

            function generateTableData(tables){
                tables.forEach(function(table, i){
                    var temp = {};
                    (table || []).forEach(function(row){
                        temp[row.name] = {
                            type: row.type
                        };
                    });
                    tables[i] = temp;
                });
                return tables;
            }
        }
    ])

    .directive('editorPanels',
    ['$compile', '$templateCache',
        function($compile,   $templateCache){
            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    scope.$watch('currentPanel', function(val){
                        appendPanel(val);
                    });

                    function appendPanel(currentPanel){
                        if(!angular.isDefined(scope.panels) || !angular.isDefined(currentPanel)) return;
                        var template = '';
                        var panels = scope.panels;
                        for(var i = 0, len = panels.length; i < len; i++){
                            if(panels[i].type === currentPanel){
                                template = $templateCache.get(panels[i].template);
                                break;
                            }
                        }

                        element.html('');

                        if(template){
                            var $panel = angular.element('<div></div>');
                            $panel.append(template);
                            $compile($panel)(scope);
                            element.append($panel);
                        }
                    }
                }
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
                    var editor = ace.edit(element[0]);

                    scope.editor = editor;

                    editor.setTheme('ace/theme/twilight');

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
    ])

    .directive('editorIframe',
    [
        function(){
            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    element.on('load', function(){
                        scope.$emit('editorIframeLoadSuccess');
                    });

                    scope.$on('editorIframeStartLoad', function(){
                        element[0].src = element[0].src;
                    });
                }
            };
        }
    ]);
});