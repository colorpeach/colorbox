define(['js/app', 'ace/ace'], function(app, ace){
    app
//     .factory('layoutConfig',
//     ['storage',
//         function(storage){

//         }
//     ])

    .value('editorNav', [
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
    ])

    .controller('editAppProCtrl',
    ['$scope', 'editorNav',
        function($scope,   editorNav){
            $scope.editorNav = editorNav;
            $scope.layoutConfig = {
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

            $scope.tabs = [
                {name: 'app.js'}
            ];

            $scope.files = [
                {id: 0, name: 'demo'},
                {id: 1, parentId: 0, name: 'app.js'}
            ];
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