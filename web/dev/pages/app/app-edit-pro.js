define(['js/app', 'ace/ace'], function(app, ace){
    app

    .value('editorNavConfig', {
        editorNav: [
            {
                name: '文件', 
                subNav: [
                    {name: '新建'}
                ]
            },
            {
                name: '视图',
                subNav: [
                    {name: '布局'},
                    {name: '窗口'}
                ]
            }
        ],
        panels: [
            {name: '数据源', type: 'source'},
            {name: '路由', type: 'route'}
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
                layouts: [
                    {dir: 'h', groupReals: [20, 80], items: [[{index: 0}], [{index: 1, real: 60}, {index: 2, real: 40}]]}
                ]
            };
        }
    ])

    .factory('appProMethod',
    ['xtree.export', 'xtree.config', 
        function(tree,   treeConfig){
            return function($scope){

                treeConfig.ondblclick = function(e, node){
                    if(node.isParent || node.children) return;
                    $scope.openFile(node.unique);
                };

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
                    $scope.openFile(node.unique);
                };

                $scope.delFile = function(){
                    var node = tree.getSelected();
                    var tabIndex;
                    if(node){
                        tree.deleteSelected();
                        if((tabIndex = $scope.tabs.indexOf(node.unique)) > -1){
                            $scope.tabs.splice(tabIndex, 1);
                            node.unique === $scope.currentTab && fixCurrent($scope.tabs, 'currentTab', tabIndex);
                        }
                    }
                };

                //关闭tab
                $scope.closeTab = function(type, index){
                    var tabs = $scope[type];
                    var current = type === 'tabs' ? 'currentTab' : 'currentPanel';

                    tabs.splice(index, 1);
                    fixCurrent(tabs, current, index);
                };

                $scope.getNode = function(data){
                    if(!$scope.files.length) return;
                    return tree.getNode(data);
                };

                function fixCurrent(tabs, current, index){
                    if(!tabs.length){
                        $scope[current] = null;
                    }else if(index >= tabs.length){
                        $scope[current] = tabs[tabs.length - 1];
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
            $scope.panelTabs = [1];
            $scope.currentPanel = 0;

            appProMethod($scope);

            $scope.setLoad({
                loading: true,
                loadMessage: '载入应用'
            });
            appProCrud.get($routeParams.id)
            .success(function(data){
                angular.forEach(data.app.files, function(n, i){
                    n.index = i;
                });
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
    [
        function(){
            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    var editor = ace.edit(element[0]);

                    scope.editor = editor;
                }
            };
        }
    ]);
});