define(['js/app'], function(app){
    app

    .value('xtree.config', {
        unNameText: '新建',
        treeClass: 'aui-tree',
        iconClass: 'aui-tree-icon',
        nodeClass: 'aui-tree-node',
        singleClass: 'icon-file4',
        expandClass: 'icon-folder-open',
        collapseClass: 'icon-folder',
        activeClass: 'aui-active',
        onedit: angular.noop,
        onclick: angular.noop,
        ondblclick: angular.noop,
        oncollapse: angular.noop,
        treeTemplate: function(){
            return '<ul class="{{treeClass}}" >'
                + '<li ng-repeat="node in sorted.tree" xtreenode  ng-show="!_hide">'
                + '<span style=\'padding-left: {{(node.level+1) * 20 + "px"}}\' ng-class="{true:activeClass}[opera.activeNode === node]" ng-dblclick="dblclick($event)" ng-click="click($event)">'
                + '<span ng-class="!node.isParent ? singleClass : _collapsed ? collapseClass : expandClass" ng-click="collapse($event)"></span>'
                + '<a class="{{nodeClass}}" ng-blur="blur($event)" ng-keydown="keydown($event)" contenteditable={{!!_editing}}>{{node.name}}</a>'
                + '</span>'
                + '</li>'
                + '</ul>';
        }(),
    })

    .value('xtree.exportProp', {})

    .controller('xtreeController',
    ['$scope', 'xtree.config', '$timeout',
        function($scope,   config,   $timeout){
            function time(){
                return new Date().getTime();
            }

            $scope.collapse = function($event){
                var level = this.node.level;
                var link = this.$$nextSibling;

                this._collapsed = !this._collapsed;

                while(link && (link.node.level !== level)){
                    link._hide = this._collapsed;
                    link = link.$$nextSibling;
                }
            };

            $scope.click = function($event){
                var gap = time() - this.editDelay;

                if(this.editDelay && gap < 800 && gap > 300){
                    this._editing = true;
                    $scope._editingScope = this;
                    $timeout(function(){
                        $event.target.focus();
                    }, 0);
                }
                
                this.editDelay = time();
                
                $scope.opera.activeNode = this.node;
                $scope.opera.activeScope = this;
                config.onclick($event, this.node, this);
            };

            $scope.dblclick = function($event){
                config.ondblclick($event, this.node, this);
            };

            $scope.blur = function($event){
                this._editing = false;
                this.node.name = $event.target.textContent;
                $scope._editingScope = null;
                config.onedit($event, this.node, this);
            };

            $scope.keydown = function($event){
                if($event.keyCode === 13){
                    $event.preventDefault();
                    $scope.blur.call(this, $event);
                }
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
                },
                sort: function(list){
                    var childrenMap = {};
                    var topList = [];

                    for(var i=0,l=list.length;i<l;i++){
                        if(typeof list[i].parentId !== 'undefined' && list[i].parentId !== null){
                            if(list[i].parentId in childrenMap){
                                childrenMap[list[i].parentId].push(list[i]);
                            }else{
                                childrenMap[list[i].parentId] = [list[i]];
                            }
                        }else{
                            topList.push(list[i]);
                        }
                    }

                    return {
                        tree: sort(topList, childrenMap),
                        childrenMap: childrenMap
                    };
                }
            };

            return utils;

            function sort(list, map, r, level, parent){
                var rList = r || [];
                var lev = level || 0;

                for(var i=0, l=list.length; i<l; i++){

                    list[i].level = lev;
                    list[i].parent = parent;
                    rList.push(list[i]);

                    if(list[i].id in map){
                        list[i].isParent = true;
                        sort(map[list[i].id], map, rList, lev + 1, list[i]);
                    }
                }
                return rList;
            }
        }
    ])

    .factory('xtree.export',
    ['xtree.exportProp', 'xtree.utils',
        function(exportProp, utils){
            var exportObj = {
                getParentNode: function(node){
                    return node ? node.parent : (exportProp.activeNode || exportProp.activeNode.parent);
                },
                getSelected: function(){
                    return exportProp.activeNode;
                },
                expandSelected: function(){
                    exportProp.activeScope._collapsed = false;
                },
                deleteSelected: function(){
                    if(!exportProp.activeNode){
                        return;
                    }
                    exportObj.deleteNode(exportProp.activeNode);
                },
                cancelSelected: function(){
                    exportProp.activeNode = null;
                    exportProp.activeScope = null;
                },
                addNode: function(node){
                    !node.name && exportProp.scope.addUnNameText(node);
                    exportProp.scope.addUnique(node);
                    exportProp.scope.nodes.push(node);
                    exportProp.scope.sorted = utils.sort(exportProp.scope.nodes);
                },
                deleteNode: function(node){
                    var childrenMap = exportProp.scope.sorted.childrenMap;
                    deleteItem(node, childrenMap, exportProp.scope.nodes);
                    exportProp.scope.sorted = utils.sort(exportProp.scope.nodes);
                },
                updateNode: function(node, data){
                    angular.extend(node, data);
                    if('parentId' in data){
                        exportProp.scope.sorted = utils.sort(exportProp.scope.nodes);
                    }
                },
                getNode: function(data){
                    var nodes = exportProp.scope.nodes;
                    for(var key in data){
                        break;
                    }
                    for(var i=0,l = nodes.length; i<l; i++){
                        if(nodes[i][key] === data[key]){
                            return nodes[i];
                        }
                    }
                },
                editNode: function(node){

                },
                getScope: function(){
                    return exportProp.scope;
                }
            };

            return exportObj;

            function deleteItem(node, map, list){
                var nodeIndex;

                if((nodeIndex = list.indexOf(node)) > -1){
                    list.splice(nodeIndex, 1);
                }

                if(node.id in map){
                    for(var i=0, l=map[node.id].length; i<l; i++){
                        deleteItem(map[node.id], map, list);
                    }
                }
            }
        }
    ])

    .directive('xtree',
    ['xtree.config', 'xtree.utils', 'xtree.exportProp', '$compile', 'safeApply',
        function(config,   utils,   exportProp,   $compile,   safeApply){
            var unique = 1;
            var unNameTextReg = new RegExp(config.unNameText+'(\\d+)', 'g');

            function setUnique(list){
                for(var i=0, l=list.length; i<l; i++){
                    if(typeof list[i].unique === 'undefined'){
                        list[i].unique = unique++;
                    }
                }
            }

            return {
                restrict: 'A',
                scope:  {
                    nodes :  '=xtree'
                },
                controller:  'xtreeController',
                template: config.treeTemplate,
                link:  function(scope, element, attrs){
                    angular.extend(scope, config);

                    scope.$watch('nodes',function(){
                        setUnique(scope.nodes);
                        scope.sorted = utils.sort(scope.nodes);
                        exportProp.scope = scope;
                    });

                    scope.addUnique = function(node){
                        node.unique = unique++;
                    };

                    scope.addUnNameText = function(node){
                        var list = [];
                        element[0].innerText.replace(unNameTextReg, function(s, m){
                            list.push(+m + 1);
                        });
                        node.name = config.unNameText + (list.length ? Math.max.apply(null, list) : 1);
                    };
                    
                    scope.opera = exportProp;
                }
            };  
        }
    ]);
});