define(['angular', 'js/app'], function(_, app){
    app
    /*
    *@param resizeBox {Object}
    *
    *   {
    *       resizeBarWidth: 10,
    *       items: [
    *           {template: 'css-editor', hide: false},
    *           {template: 'html-editor', hide: false},
    *           {template: 'javascript-editor', hide: false},
    *           {template: 'preview', hide: false}
    *       ],
    *       laoout: 1,
    *       layouts: {
    *           1: {dir: 'v', items: [[{index: 0}, {index: 1}, {index: 2}], [{index: 3}]], groupReals: [20, 80]},
    *           2: {dir: 'h', items: [[{index: 0}, {index: 1}], [{index: 2}, {index: 3}]]}
    *       }
    *       
    *   }
    *
    *   events
    *   resizeUpdate
    *
    */
    .directive('resizeBox',
    ['$templateCache', '$rootScope', '$compile',
        function($templateCache,   $rootScope,   $compile){
            var resizeBarTpl = '<div resize-bar class="resize-bar"></div>';
                 
            //返回显示的group和item的数量
            function getShows(items, layout, groupReals){
                var showGroupsCount = 0;
                var showGroupsReal = 0;
                var showItemsReals = [];
                var showItems = [];
                var showItemsCountList = [];
                var index = 0;
                var mainOffsets = [];
                var assistOffsetsList = [];
                
                angular.forEach(layout, function(group, groupIndex){
                    var showItemsCount = 0;
                    var showItemsReal = 0;
                    var assistOffsets = [];
                    
                    angular.forEach(group, function(item, itemIndex){
                        assistOffsets.push(showItemsReal);
                        if(!items[index].hide){
                            showItemsCount++;
                            showItemsReal += item.real;
                            showItems.push([groupIndex, itemIndex, index]);
                        }
                        index++;
                    })
                    
                    showItemsReals.push(showItemsReal);
                    assistOffsetsList.push(assistOffsets);
                    mainOffsets.push(showGroupsReal);
                    if(showItemsCount){
                        showGroupsCount++;
                        showGroupsReal += groupReals[groupIndex];
                    }
                    
                    showItemsCountList.push(showItemsCount);
                });
                
                return {
                    mainOffsets: mainOffsets, //每个group的偏移
                    assistOffsetsList: assistOffsetsList, //对应group里每个item的偏移
                    groups: showGroupsCount, //显示的group个数
                    showItemsCountList: showItemsCountList, //显示的group下显示的item个数
                    showItemsReals: showItemsReals, //显示的group下对应的显示的item的real值的和
                    showGroupsReal: showGroupsReal, //显示的group的real值的和
                    showItems: showItems //显示的items（items的坐标）
                };
            }
            
            //矫正real的值
            function correctReal(items){
                items.forEach(function(group, groupIndex){
                    var totalReal = sum(group, 'real');
                    
                    if(!totalReal){
                        group.forEach(function(n, i){
                            n.real = 100 / group.length;
                        });
                    }else{
                        group.forEach(function(n, i){
                            n.real = n.real * 100/totalReal
                        });
                    }
                });
            }
            
            function sum(list, key){
                var s = 0;
                var i = 0;
                for(;i<list.length;i++){
                    s += +(key ? list[i][key] : list[i]) || 0;
                }
                return s;
            }
            
            function css(top, left, height, width){
                var unit = '%';
                return {
                    top: top + unit,
                    left: left + unit,
                    height: height + unit,
                    width: width + unit,
                    display: 'block'
                };
            }

            function getAttr(scope, key){
                var current = scope;
                var value;
                while(current && angular.isDefined(value = scope[key])){
                    current = current.$parent;
                }
                return value;
            }

            return {
                restrict: 'A',
                compile: function(){
                    return function(scope, element, attrs){
                        var config = getAttr(scope, attrs.resizeBox);
                        var current;
                        var $resizeBars = angular.element(Array(config.items.length).join(resizeBarTpl));
                        var $items = angular.element(config.items.map(function(n, i){
                                return $templateCache.get(n.template) || n.template;
                            }).join(''));

                        //填充html
                        $compile($items)(scope);
                        $compile($resizeBars)(scope);
                        element.append($items);
                        element.append($resizeBars);

                        updateLayout(config.layout);

                        scope.$on('layoutResizeBox', function(e, layout){
                            updateLayout(layout);
                        });

                        scope.$on('toggleResizeBox', function(e, i){
                            toggleResizeItem(i);
                        });
                        
                        scope.$on('resizeBarUpdate', function(e, offset, resizeTarget){
                            resizeUpdateView(current, resizeTarget, offset);
                            updateView();
                        });

                        function updateLayout(layout){
                            if(!layout){
                                for(var n in config.layouts){
                                    current = config.layouts[n];
                                    break;
                                }
                            }else{
                                current = config.layouts[layout];
                            }

                            if(!current.groupReals){
                                //TODO
                                current.groupReals = Array(current.items.length).join('|').split('|').map(function(){ return 100/current.items.length});
                            }

                            correctReal(current.items);
                            current.shows = getShows(config.items, current.items, current.groupReals)
                            updateView();
                        }

                        function toggleResizeItem(index){
                            var items = config.items;
                            items[index].hide = !items[index].hide;
                            current.shows = getShows(config.items, current.items, current.groupReals);
                            updateView();
                        }
                        
                        //resize更新
                        function resizeUpdateView(current, resizeTarget, offset){
                            var l = resizeTarget.last;
                            var n = resizeTarget.next;
                            var shows = current.shows;
                            var items = current.items;
                            var groupReals = current.groupReals;
                            
                            if(resizeTarget.type === 'item'){
                                shows.assistOffsetsList[n[0]][n[1]] = shows.assistOffsetsList[n[0]][n[1]] + offset * shows.showItemsReals[l[0]]/100;
                                items[l[0]][l[1]].real = items[l[0]][l[1]].real + offset * shows.showItemsReals[l[0]]/100;
                                items[n[0]][n[1]].real = items[n[0]][n[1]].real - offset * shows.showItemsReals[l[0]]/100;
                            }else{
                                shows.mainOffsets[n[0]] = shows.mainOffsets[n[0]] + offset * shows.showGroupsReal/100;
                                groupReals[l[0]] = groupReals[l[0]] + offset * shows.showGroupsReal/100;
                                groupReals[n[0]] = groupReals[n[0]] - offset * shows.showGroupsReal/100;
                            }
                        }

                        function updateView(){
                            var resizeBarWidth = config.resizeBarWidth;
                            var shows = current.shows;
                            var groupReals = current.groupReals;
                            var dir = current.dir;
                            var items = current.items;
                            var last;
                            
                            $items.css({display: 'none'});
                            $resizeBars.removeClass('dir-v dir-h').css({display: 'none'});

                            shows.showItems.forEach(function(n, i, arr){
                                var item = items[n[0]][n[1]];
                                var main = 100 * groupReals[n[0]]/shows.showGroupsReal;
                                var assist = 100 * item.real/shows.showItemsReals[n[0]];
                                var mainOffset = 100 * shows.mainOffsets[n[0]]/shows.showGroupsReal;
                                var assistOffset = 100 * shows.assistOffsetsList[n[0]][n[1]]/shows.showItemsReals[n[0]];
                                
                                if(dir === 'v'){
                                    item.css = css(mainOffset, assistOffset, main, assist);
                                }else{
                                    item.css = css(assistOffset, mainOffset, assist, main);
                                }
                                
                                $items.eq(n[2]).css(item.css);
                                
                                //设置resizeBar样式
                                if(i && i < arr.length){
                                    var resizeBarClass = 'dir-v';
                                    var resizeDir = 'v';
                                    var resizeType = 'item';
                                    var resizeBarCss = {
                                        top: 0,
                                        left: 0,
                                        width: resizeBarWidth + 'px',
                                        height: resizeBarWidth + 'px',
                                        marginLeft: 0,
                                        marginTop: 0,
                                        display: 'block'
                                    };
                                    
                                    //如果last和next在同一个group
                                    if(arr[i-1][0] === n[0]){
                                        if(dir === 'v'){
                                            resizeBarCss.left = assistOffset + '%';
                                            resizeBarCss.top = mainOffset + '%';
                                            resizeBarCss.height = main + '%';
                                            resizeBarCss.marginLeft = -resizeBarWidth/2 + 'px'
                                        }else{
                                            resizeBarCss.left = mainOffset + '%';
                                            resizeBarCss.top = assistOffset + '%';
                                            resizeBarCss.width = main + '%';
                                            resizeBarCss.marginTop = -resizeBarWidth/2 + 'px'
                                            resizeBarClass = 'dir-h';
                                            resizeDir = 'h';
                                        }
                                    }else{
                                        if(dir === 'v'){
                                            resizeBarCss.top = mainOffset + '%';
                                            resizeBarCss.width = '100%';
                                            resizeBarCss.marginTop = -resizeBarWidth/2 + 'px';
                                            resizeBarClass = 'dir-h';
                                            resizeDir = 'h';
                                        }else{
                                            resizeBarCss.left = mainOffset + '%';
                                            resizeBarCss.height = '100%';
                                            resizeBarCss.marginLeft = -resizeBarWidth/2 + 'px';
                                        }
                                        resizeType = 'group';
                                    }
                                    $resizeBars.eq(i-1)
                                        .addClass(resizeBarClass)
                                        .css(resizeBarCss)
                                        .data('resizeTarget', {last: arr[i-1], next: n, type: resizeType, dir: resizeDir});
                                }
                            });
                            

                            $rootScope.$broadcast('resizeUpdate');
                        }
                    };
                }
            };
        }
    ])

    .directive('resizeBar',
    ['$rootScope', '$window',
        function($rootScope,   $window){
            var resizeMarkTpl = '<div class="resize-mark"></div>';
            var resizeOverlayTpl = '<div class="resize-overlay"></div>';
            var eventsMap = {
                web: {
                    down: 'mousedown',
                    up: 'mouseup',
                    move: 'mousemove'
                },
                mobile: {
                    down: 'touchstart',
                    up: 'touchend',
                    move: 'touchmove'
                }
            };
            var device;

            if($window.document.hasOwnProperty("ontouchstart")){
                device = 'mobile';
            }else{
                device = 'web';
            }

            return {
                restrict: 'A',
                compile: function(){
                    return function(scope, element, attrs){
                        element.on(eventsMap[device].down, function(e){
                            e.preventDefault();
                            var resizeTarget = element.data('resizeTarget');
                            var dir = resizeTarget.dir;
                            var $resizeMark = angular.element(resizeMarkTpl);
                            var $resizeOverlay = angular.element(resizeOverlayTpl);
                            var $parent = element.parent();
                            var pRect = $parent[0].getBoundingClientRect();
                            var rect = element[0].getBoundingClientRect();
                            var point = {
                                x: (e.touches ? e.touches[0].clientX : e.clientX) - pRect.left,
                                y: (e.touches ? e.touches[0].clientY : e.clientY) - pRect.top
                            };
                            var relative = point;

                            if(dir === 'v'){
                                $resizeMark.css({
                                    top: rect.top - pRect.top + 'px',
                                    left: 5 + rect.left - pRect.left + 'px',
                                    width: '1px',
                                    height: rect.height + 'px'
                                });
                            }else{
                                $resizeMark.css({
                                    top: 5 + rect.top - pRect.top + 'px',
                                    left: rect.left - pRect.left + 'px',
                                    width: rect.width + 'px',
                                    height: '1px'
                                });
                            }

                            $parent.append($resizeMark).append($resizeOverlay);

                            $parent.on(eventsMap[device].move, function(e){
                                point = {
                                    x: (e.touches ? e.touches[0].clientX : e.clientX) - pRect.left,
                                    y: (e.touches ? e.touches[0].clientY : e.clientY) - pRect.top
                                };

                                $resizeMark.css(dir === 'v' ? {left: point.x + 'px'} : {top: point.y + 'px'});
                            });

                            $parent.on(eventsMap[device].up, function(e){
                                $resizeMark.remove();
                                $resizeOverlay.remove();
                                $parent.off(eventsMap[device].move);
                                $parent.off(eventsMap[device].up);
                                resize(resizeTarget, pRect, point, relative);
                            });
                        });

                        function resize(resizeTarget, pRect, point, relative){
                            var offset;
                            
                            if(resizeTarget.dir === 'v'){
                                offset = (point.x - relative.x) * 100/pRect.width;
                            }else{
                                offset = (point.y - relative.y) * 100/pRect.height;
                            }

                            $rootScope.$broadcast('resizeBarUpdate', offset, resizeTarget);
                        }
                    };
                }
            };
        }
    ]);
});