define(['js/app'], function(app){
    app

    .value('xtree.config', {
        simpleData: true,
        treeClass: 'aui-tree',
        iconClass: 'aui-tree-icon',
        nodeClass: 'aui-tree-node',
        singleClass: 'icon-file4',
        expandClass: 'icon-folder-open',
        collapseClass: 'icon-folder',
        activeClass: 'aui-active',
        onclick: angular.noop,
        oncollapse: angular.noop,
        nodeTemplate: function(){
            return '<span ng-class="!node.children.length ? singleClass : _collapsed ? collapseClass : expandClass" ng-click="collapse($event)"></span>'
                + '<a class="{{nodeClass}}" ng-class="{true:activeClass}[opera.activeNode === node]" ng-click="click($event)">{{node.name}}</a>'
                + '<ul ng-show="!_collapsed">'
                + '<li ng-repeat="node in node.children" xtreenode></li>'
                + '</ul>';
        }(),
        treeTemplate: function(){
            return '<ul class="{{treeClass}}">'
                + '<li ng-repeat="node in node.children" xtreenode></li>'
                + '</ul>';
        }(),
    })

    .value('xtree.exportProp', {
        activeNode: {},
        scope: {},
        data: []
    })

    .controller('xtreeController',
    ['$scope', 'xtree.config',
        function($scope,config){

            $scope.collapse = function($event){
                this._collapsed = !this._collapsed;
            };

            $scope.click = function($event){
                $scope.opera.activeNode = this.node;
                $scope.opera.scope = this;
                config.onclick($event,this.node,this);
            };
        }
    ])

    .factory('xtree.utils',
    [
        function(){
            var utils = {
                transformToNexted: function(data){
                    var map = [];
                    var r = [];

                    for(var i=0,len=data.length;i<len;i++){
                        map[data[i].id] = data[i];
                    }

                    for(i=0;i<len;i++){
                        if(map[data[i].parentId] && data[i].id != data[i].parentId){

                            if(!map[data[i].parentId].children){
                                map[data[i].parentId].children = [];
                            }

                            map[data[i].parentId].children.push(data[i]);

                        }else{
                            r.push(data[i]);
                        }
                    }

                    return r;
                }
            };

            return utils;
        }
    ])

    .factory('xtree.export',
    ['xtree.exportProp',
        function(exportProp){
            var exportObj = {
                getParentNode: function(){
                    return exportProp.scope.$parent.node;
                },
                getSelected: function(){
                    return exportProp.activeNode;
                },
                expandSelected: function(){
                    exportProp.scope._collapsed = false;
                },
                deleteSelected: function(){
                    if(!exportProp.scope){
                        return;
                    }
                    var i = 0;
                    var nodes = exportProp.scope.$parent.node.children;
                    var len = nodes.length;
                    var activeNode = exportProp.activeNode;
                    for(;i<len;i++){
                        if(activeNode === nodes[i]){
                            nodes.splice(i,1);
                            exportProp.scope.$destroy();
                            exportProp.scope = null;
                            exportProp.activeNode = null;
                            break;
                        }
                    }
                },
                cancelSelected: function(){
                    exportProp.activeNode = null;
                    exportProp.scope = null;
                },
                getData: function(){
                    return exportProp.data;
                }
            };

            return exportObj;
        }
    ])

    //borrow from ngInclude ,but don't create a new childscope
    .directive('xtreenode',
    ['xtree.config', '$templateCache', '$compile',
        function(config,   $templateCache,   $compile){
            return {
                restrict: 'A',
                compile:  function(element, attr) {
                    var template = config.nodeTemplate;

                    return function(scope, element, attr) {
                        var node = angular.element(template);
                        
                        $compile(node)(scope);
                        element.append(node);
                    };
                }
            };
        }
    ])

    .directive('xtree',
    ['xtree.config', 'xtree.utils', 'xtree.exportProp', '$compile',
        function(config,   utils,   exportProp,   $compile){
            return {
                restrict: 'A',
                scope:  {
                    nodes :  '=xtree'
                },
                controller:  'xtreeController',
                template: config.treeTemplate,
                link:  function(scope, element, attrs){
                    angular.extend(scope, config);

                    scope.node = {
                        children: scope.nodes
                    };

                    if(config.simpleData){
                        scope.$watch('nodes',function(){
                            exportProp.data = scope.node.children = utils.transformToNexted(scope.nodes);
                        });
                    }

                    scope.opera = exportProp;
                    
                }
            };  
        }
    ]);
});