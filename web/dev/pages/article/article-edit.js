define(['js/app', 'ace/ace', 'showdown', 'showdown/extensions/code', 'showdown/extensions/table'], function(app, ace){
    app

    .value('article::layoutConfig',
    {
        resizeBarWidth: 10,
        items: [
            {template: 'article-list', hide: true, title: '列表'},
            {template: 'article-editor', hide: false, title: '编辑'},
            {template: 'article-preview', hide: false, title: '预览'}
        ],
        layout: 0,
        layouts: {
            0: {dir: 'h', groupReals: [20, 40, 40], items: [[{index: 0}], [{index: 1}], [{index: 2}]]}
        }
    })

    .value('article::functions',
    [
        {title: '加粗 <strong>', icon: 'icon-bold', command: 'replaceText', params: ['**%s**', '加粗文本'], key: 'Ctrl-B'},
        {title: '斜体 <em>', icon: 'icon-italic', command: 'replaceText', params: ['_%s_', '斜体文本'], key: 'Ctrl-I'},
        {title: '超链接 <a>', icon: 'icon-link', command: 'dialogOpen', key: 'Ctrl-L', params: 'link'},
        {title: '图片 <img>', icon: 'icon-image', command: 'dialogOpen', key: 'Ctrl-Q', params: 'image'},
        {title: '块引用 <blockquote>', icon: 'icon-indent-increase', command: 'replaceText', params: ['\n> %s\n', '引用'], key: 'Ctrl-K'},
        {title: '代码 <code>', icon: 'icon-embed', command: 'replaceText', params: ['\n```\n%s\n```\n', '代码'], key: 'Ctrl-G'},
        {title: '有序列表 <ol>', icon: 'icon-list-numbered', command: 'replaceText', params: ['\n1. %s\n', '列表项'], key: 'Ctrl-O'},
        {title: '无序列表 <ul>', icon: 'icon-list', command: 'replaceText', params: ['\n* %s\n', '列表项'], key: 'Ctrl-U'},
        {title: '标题 <h1>~<h6>', icon: 'icon-text-height', command: 'replaceText', params: ['\n# %s\n', '标题'], key: 'Ctrl-H'},
        {title: '分隔线 <hr>', icon: 'icon-page-break', command: 'replaceText', params: ['\n***\n', ''], key: 'Ctrl-R'},
        {title: '保存', icon: 'icon-floppy-disk', command: 'save', key: 'Ctrl-S', disable: '!currentFile.isChange || layoutConfig.items[1].hide'},
        {title: '撤销', icon: 'icon-undo2', command: 'editor.undo', disable: '!editor.session.getUndoManager().hasUndo() || layoutConfig.items[1].hide', key: 'Ctrl-Z'},
        {title: '还原', icon: 'icon-redo2', command: 'editor.redo', disable: '!editor.session.getUndoManager().hasRedo() || layoutConfig.items[1].hide', key: 'Ctrl-Y'},
    ])

    .controller('editArticleCtrl',
    ['$scope', '$location','article::layoutConfig', 'article::functions', 'storage', 'data::store', '$timeout', 'dialog', 'safeApply',
        function($scope,   $location,   layoutConfig,    functions,   storage,   store,   $timeout,   dialog,   safeApply){
            $scope.dialog = dialog({
                template: 'edit-article-dialog',
                scope: $scope,
                maxWidth: '600px'
            });
            $scope.prompts = [];

            //获取文档列表
            store('article', 'getArticles')
            .success(function(data){
                $scope.files = data.articles;
            });

            $scope.setLoad({
                loading: true,
                loadMessage: '加载文档内容'
            });
            //获取当前编辑文档
            store('article', 'get', $location.search()._id)
            .success(function(data){
                $scope.currentFile = data.article;
                if($scope.files){
                    for(var i = 0, len = $scope.files.length; i < len; i++){
                        if($scope.files[i]._id === $scope.currentFile._id){
                            $scope.files[i] = $scope.currentFile;
                        }
                    }
                }
            });
            
            angular.forEach(functions.slice(0, -3), function(n){
                n.disable = 'layoutConfig.items[1].hide';
            });

            $scope.layoutConfig = layoutConfig;
            $scope.functions = functions;
            $scope.defaultName = '未命名';
            $scope.status = {
                editingName: false
            };

            $scope.dialogOpen = function(type){
                $scope.dialogType = type;
                $scope.$broadcast('dialogOpen', type);
                $scope.dialog.open();
                safeApply.apply($scope);
            };

            //保存文件名
            $scope.saveName = function(){
                var data = {
                    _id: $scope.currentFile._id,
                    name: $scope.currentFile.name
                };
                var promptMessage = {
                    message: '正在保存文档名',
                    status: 'doing'
                };
                $scope.prompts.push(promptMessage);

                store('article', 'save', data)
                .success(function(){
                    promptMessage.message = promptMessage.message.replace('正在', '') + '成功';
                    promptMessage.status = 'success';
                    $scope.editName(false);
                    $scope.removePrompt(promptMessage);
                })
                .error(function(){
                    promptMessage.status = 'error';
                });
            };
            
            //隐藏显示区块
            $scope.toggleBlock = function(i){
                $scope.$broadcast('toggleResizeBox', i);
            };

            $scope.editName = function(mark){
                $scope.status.editingName = mark;
            };

            $scope.selectFile = function($index, _id){
                if($scope.currentFile._id === $scope.files[$index]._id) return;

                $scope.currentFile = $scope.files[$index];
                $location.search('_id', $scope.currentFile._id);

                if(angular.isUndefined($scope.currentFile.content)){
                    $scope.setLoad({
                        loading: true,
                        loadMessage: '加载文档内容'
                    });
                    store('article', 'get', $scope.currentFile._id)
                    .success(function(data){
                        $scope.files[$index] = $scope.currentFile = data.article;
                    });
                }
            };

            $scope.disable = function(fun){
                return $scope.$eval(fun.disable);
            };
            
            //操作
            $scope.opera = function(fun){
                if($scope.editor){
                    var expression = [fun.command, '(', ')'];
                    expression.splice(2, 0, angular.toJson(fun.params));
                    $scope.$eval(expression.join(''));
                }
            };

            $scope.replaceText = function(params){
                var ranges = $scope.editor.selection.getAllRanges();
                angular.forEach(ranges, function(n, i){
                    //替换选择的文本
                    var selectionText = $scope.editor.session.getTextRange(n);
                    var tpl = params[0];
                    var text = selectionText || params[1];
                    var range = $scope.editor.session.replace(n, tpl.replace('%s', text));
                    var offset = tpl.indexOf('%s');

                    if(text.length){
                        //选中提供编辑的文本
                        var start = {
                            row: range.row,
                            column: range.column
                        };
                        var end = {};

                        if(offset > -1){
                            while(tpl[offset++] !== undefined){
                                if(tpl[offset] === '\n'){
                                    start.row--;
                                }
                            }
                        }
                        tpl.replace(/(?:^|\n)(.*)%s/, function(s, m){
                            if(start.row !== range.row){
                                start.column = m.length;
                            }else{
                                start.column = n.start.column + m.length;
                            }
                        });
                        end.row = start.row;
                        end.column = start.column + text.length;

                        $scope.editor.selection.setSelectionRange({end: end, start: start});
                    }
                });

                $scope.editor.focus();
            };

            //保存文档内容
            $scope.save = function(){
                if(!$scope.currentFile.isChange) return;
                var content = $scope.editor.getValue();
                var data = {
                    _id: $scope.currentFile._id,
                    content: content
                };
                var promptMessage = {
                    message: '正在保存文档内容',
                    status: 'doing'
                };
                $scope.prompts.push(promptMessage);

                store('article', 'save', data)
                .success(function(){
                    promptMessage.message = promptMessage.message.replace('正在', '') + '成功';
                    promptMessage.status = 'success';
                    $scope.$broadcast('editorSaved');
                    $scope.removePrompt(promptMessage);
                })
                .error(function(){
                    promptMessage.status = 'error';
                });
            };

            $scope.removePrompt = function(prompt){
                $timeout(function(){
                    for(var i = 0, len = $scope.prompts.length; i < len; i++){
                        if(prompt === $scope.prompts[i]){
                            $scope.prompts.splice(i, 1);
                            break;
                        }
                    }
                }, 2000);
            }
        }
    ])

    .controller('editArticleLinkCtrl',
    ['$scope',
        function($scope){
            var defaultLink = 'http://colorpeach.com';
            $scope.link = defaultLink;

            $scope.$on('dialogOpen', function(e, type){
                if(type === 'link'){
                    $scope.$parent.dialog.setOption('onClose', function(){
                        $scope.link = defaultLink;
                        $scope.$parent.dialogType = '';
                        safeApply.call($scope.$parent);
                    });
                }
            });

            $scope.submit = function(){
                $scope.$parent.dialog.close();
                $scope.replaceText(['[%s](' + $scope.link + ')', '链接']);
            };
        }
    ])

    .controller('editArticleImageCtrl',
    ['$scope', 'safeApply',
        function($scope,   safeApply){
            var defaultImage = 'http://www.baidu.com/img/bd_logo1.png';
            $scope.image = defaultImage;

            $scope.$on('dialogOpen', function(e, type){
                if(type === 'image'){
                    $scope.$parent.dialog.setOption('onClose', function(){
                        $scope.image = defaultImage;
                        $scope.$parent.dialogType = '';
                        safeApply.call($scope.$parent);
                    });
                }
            });

            $scope.submit = function(){
                $scope.$parent.dialog.close();
                $scope.replaceText(['![%s](' + $scope.image + ')', '图片描述']);
            };
        }
    ])

    .directive('articleEditor',
    ['$timeout', '$sce', 'safeApply',
        function($timeout,   $sce,   safeApply){
            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    var resizeTimer;
                    var editor = ace.edit(element[0]);

                    scope.editor = editor;

                    editor.renderer.setShowGutter(false);
                    editor.renderer.setPadding(10);
                    editor.session.highlight(false);
                    editor.setTheme('ace/theme/chrome');

                    editor.on('input', function(){
                        if(!scope[attrs.articleEditor]) return;
                        if(editor.session.getUndoManager().isClean()){
                            scope[attrs.articleEditor].isChange = false;
                        }else{
                            scope[attrs.articleEditor].isChange = true;
                        }
                        scope.html = editor.getValue();
                        scope.$apply();
                    });

                    //给编辑按钮绑定快捷键
                    angular.forEach(scope.functions.slice(0, -2), function(n, i){
                        editor.commands.addCommand({
                            name: n.title,
                            bindKey: {win: n.key,  mac: n.key.replace('Ctrl', 'Command')},
                            exec: function(editor) {
                                scope[n.command](n.params);
                            },
                            readOnly: false
                        });
                    });

                    scope.$on('editorSaved', function(){
                        editor.session.getUndoManager().markClean();
                        safeApply(function(){
                            scope[attrs.articleEditor].isChange = false;
                        });
                    });

                    scope.$watch(attrs.articleEditor, function(file){
                        if(file){
                            if(!file.editSession){
                                file.editSession = ace.createEditSession(file.content || '');
                            }
                            editor.setSession(file.editSession);
                            editor.session.setMode("ace/mode/markdown");
                            editor.focus();
                            scope.html =  editor.getValue();
                        }
                    });

                    editor.renderer.scrollBar.on('scroll', function(){
                        console.log(arguments);
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

    .directive('markdownPreview',
    ['$sanitize', '$document',
        function($sanitize,   $document){
            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    var converter = new Showdown.converter({extensions: ['code', 'table']});
                    
                    scope.$watch(attrs.markdownPreview, function(val){
                        if(val){
                            try{
                                element.html($sanitize(converter.makeHtml(val)));
                                var $sequence = angular.element(document.querySelectorAll('code.sequence', element));
                                var $flow = angular.element(document.querySelectorAll('code.flow', element));

                                if($sequence.length){
                                    require(['sequence-diagram'], function(Diagram){
                                        angular.forEach($sequence, function(n){
                                            var diagram = Diagram.parse(n.textContent);
                                            n.innerHTML = '';
                                            diagram.drawSVG(n);
                                        });
                                    });
                                }

                                if($flow.length){
                                    require(['flowchart'], function(flowchart){
                                        angular.forEach($flow, function(n){
                                            var diagram = flowchart.parse(n.textContent);
                                            n.innerHTML = '';
                                            diagram.drawSVG(n);
                                        });
                                    });
                                }
                            }catch(e){
//                                 element.html(converter.makeHtml(val));
                            }
                        }
                    });
                }
            };
        }
    ]);
});