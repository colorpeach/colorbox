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
                    {name: '布局'}
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

    .controller('editAppProCtrl',
    ['$scope', 'editorNavConfig', 'layoutConfig', 'xtree.export', 'xtree.config',
        function($scope,   editorNavConfig,   layoutConfig,   tree,   treeConfig){
            $scope.editorNav = editorNavConfig.editorNav;
            $scope.layoutConfig = layoutConfig;
            $scope.panels = editorNavConfig.panels;
            $scope.files = [
                {id: 0, name: 'demo', type: 'folder'},
                {id: 1, parentId: 0, name: 'app.js', type: 'file', content: 'var a=1;'}
            ];
            $scope.tabs = [];
            $scope.consoleTabs = [];

            $scope.addFile = function(){
                tree.getData().push({name: '新建文件', type: 'file', parentId: 0});
            };

            treeConfig.ondblclick = function(e, node){
                var tabIndex;

                if((tabIndex = $scope.tabs.indexOf(node.index)) < 0){
                    $scope.currentTab = $scope.tabs.length;
                    $scope.tabs.push(node.index);
                }else{
                    $scope.currentTab = tabIndex;
                }
            };

            $scope.close = function(type, index){
                $scope[type].splice(index, 1);
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
                }
            };
        }
    ]);
});