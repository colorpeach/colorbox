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
                    var tabIndex;

                    if(node.isParent || node.children) return;

                    if((tabIndex = $scope.tabs.indexOf(node.id)) < 0){
                        $scope.currentTab = $scope.tabs.length;
                        $scope.tabs.push(node.id);
                    }else{
                        $scope.currentTab = tabIndex;
                    }
                };

                $scope.addFile = function(){
                    tree.getData().push({name: '新建文件', type: 'file', parentId: 0});
                };
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
                angular.forEach(data.app.files, function(n){
                    if(!angular.isDefined(n.parentId)){
                        n.parentId = 'app';
                    }
                });
                $scope.files = data.app.files;
                $scope.app = data.app;
            });

            //关闭tab
            $scope.closeTab = function(type, index){
                $scope[type].splice(index, 1);
            };
            
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