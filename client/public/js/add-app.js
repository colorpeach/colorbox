define(['js/app', 'cm/lib/codemirror', 'js/dashboard'], function(app, CodeMirror){
    app
    .controller('addAppCtrl',
    ['$scope', 'appsCrud', '$routeParams', '$window', '$sce',
        function($scope,   appsCrud,   $routeParams,   $window,   $sce){
            $scope.data = {};
            appsCrud.get($routeParams.id)
            .success(function(data){
                $scope.data = data.app;
                $scope.previewUrl = $sce.trustAsResourceUrl('/_apps/preview/' + data.app._id);
            });

            $scope.submit = function(e, key){
                e && e.preventDefault();
                var data = {_id: $scope.data._id};

                if(key){
                    data[key] = $scope.data[key];
                }else{
                    data = $scope.data;
                }

                appsCrud.save(data)
                .success(function(){
                    $window.frames[0].location.reload();
                });
            };

            $scope.jade = {
                mode: 'jade',
                key: 'jade',
                save: save
            };
            $scope.css = {
                mode: 'css',
                key: 'css',
                save: save
            };
            $scope.javascript = {
                mode: 'javascript',
                key: 'js',
                save: save
            };

            function save(e){
                $scope.submit(e, this.key);
            }
        }
    ])

    .directive('resizeBox',
    ['utils', '$compile',
        function(utils,   $compile){
            var resizeBarHCss = {marginTop: '-5px', height: '10px'};
            var resizeBarVCss = {marginLeft: '-5px', width: '10px'};
            var layouts = {
                    1: {dir: 'h', list: [['jade', 'css', 'js'], ['preview']]},
                    2: {dir: 'v', list: [['jade', 'js'], ['css', 'preview']]},
                    3: {dir: 'v', list: [['jade', 'css', 'js'], ['preview']]},
                    4: {dir: 'h', list: [['jade', 'css', 'js', 'preview']]}
                };
            var boxs = {
                    jade: {show: true, index: 0},
                    css: {show: true, index: 1},
                    js: {show: true, index: 2},
                    preview: {show: true, index: 3}
                };
            var resizeBarTpl = utils.heredoc(function(){/*!
                    <div resize-bar class="resize-bar"></div>
                */});

            //计算实际显示的行或列尺寸总和
            function getShowRate(list, dir, isGroup){
                var l = 0;

                if(isGroup){
                    var key = dir === 'h' ? 'height' : 'width';
                    list.forEach(function(n, i){
                        var box = boxs[n[0]];
                        var show = n.some(function(x){ return boxs[x].show;});
                        l += parseFloat(show && box.real && box.real[key]) || 0
                    });
                }else{
                    var key = dir === 'h' ? 'width' : 'height';
                    list.forEach(function(n, i){
                        var box = boxs[n];
                        l += parseFloat(box.show && box.real && box.real[key]) || 0
                    });
                }

                return (l || 100)/100;
            }
            //根据布局方向返回css
            function getCss(dir, valList){
                var list = dir === 'h' ? ['width', 'height', 'left', 'top'] : ['height', 'width', 'top', 'left'];
                var css = {};

                list.forEach(function(n, i){
                    css[n] = valList[i];
                });

                return css;
            }

            function setRealSize(scope){
                var layout = scope.layouts[scope.layoutIndex];
                var list = layout.list;
                var main = 100/list.length;

                list.forEach(function(group){
                    var support = 100/group.length;
                    group.forEach(function(item){
                        scope.boxs[item].real = layout.dir === 'h' ? {width: support, height: main} : {width: main, height: support};
                        scope.boxs[item].mainRate = 1;
                        scope.boxs[item].supportRate = 1;
                    });
                });
            }

            return {
                restrict: 'A',
                compile: function(){
                    return function(scope, element, attrs){
                        var $boxs = element.children();
                        var boxCount = $boxs.length;
                        var $resizeBars = angular.element(Array(boxCount).join(resizeBarTpl));
                        var resizeMap = {};

                        scope.layoutIndex = 1;
                        scope.layouts = layouts;
                        scope.boxs = boxs;

                        scope.$watch('layoutIndex', function(i){
                            setRealSize(scope);
                            updateView(i);
                        });
                        scope.toggle = function(box){
                            box.show = !box.show;
                            updateView(scope.layoutIndex);
                        };

                        $compile($resizeBars)(scope);
                        element.append($resizeBars);

                        //根据layout和boxs更新布局
                        function updateView(layoutIndex){
                            var layout = scope.layouts[layoutIndex || 1];
                            var resizeBarIndex = 0;
                            var groupIndex = 0;
                            var lastGroup;
                            var mainRate = getShowRate(layout.list, layout.dir, true);
                            var mainOffset = 0;
                            var main = layout.dir === 'h' ? 'height' : 'width';
                            var support = layout.dir === 'v' ? 'height' : 'width';

                            $resizeBars.removeClass('dir-h dir-v');

                            layout.list.forEach(function(n){
                                var lastItem;
                                var supportRate = getShowRate(n, layout.dir);
                                var supportOffset = 0;
                                var realMain = 0;

                                n.forEach(function(m){
                                    var boxCss = {position: 'absolute', display: boxs[m].show ? 'block' : 'none'};
                                    var real = boxs[m].real;
                                    var css = getCss(layout.dir, [real[support]/supportRate + '%', real[main]/mainRate + '%', supportOffset/supportRate + '%', mainOffset/mainRate + '%']);

                                    boxs[m].resizeBarIndex = null;
                                    //记录boxs的位置
                                    angular.extend(boxs[m], css);
                                    $boxs.eq(boxs[m].index).css(angular.extend({}, css, boxCss));
                                    if(supportOffset && boxs[m].show){
                                        //当前group有item显示
                                        $resizeBars.eq(resizeBarIndex)
                                            .css(angular.extend({}, css, layout.dir === 'h' ? resizeBarVCss : resizeBarHCss))
                                            .addClass(layout.dir === 'h' ? 'dir-v' : 'dir-h')
                                            //记录调整尺寸的目标
                                            .data('resizeTarget', {last: lastItem, next: m});
                                        //扩展boxs和resizebar的关系
                                        boxs[m].resizeBarIndex = resizeBarIndex + boxCount;
                                        boxs[m].mainRate = mainRate;
                                        boxs[m].supportRate = supportRate;

                                    }

                                    if(boxs[m].show){
                                        lastItem = m;
                                        supportOffset && resizeBarIndex++;
                                        supportOffset += real[support];
                                        realMain = real[main];
                                    }
                                });

                                if(supportOffset && mainOffset){
                                    //当前group至少有一个item显示
                                    $resizeBars.eq(resizeBarIndex)
                                        .css(getCss(layout.dir, ['100%', '10px', 0, mainOffset/mainRate + '%']))
                                        .css(layout.dir === 'h' ? {marginTop: '-5px'} : {marginLeft: '-5px'})
                                        .addClass(layout.dir === 'h' ? 'dir-h' : 'dir-v')
                                        //记录调整尺寸的目标
                                        .data('resizeTarget', {last: lastGroup, next: n});
                                }

                                if(supportOffset){
                                    lastGroup = n;
                                    mainOffset && resizeBarIndex++;
                                    mainOffset += realMain;
                                }
                            });
                        }
                    }
                }
            };
        }
    ])

    .directive('resizeBar', 
    ['utils', 
        function(utils){
            var resizeMarkTpl = utils.heredoc(function(){/*!
                    <div class="resize-mark"></div>
                */});
            var resizeOverlayTpl = utils.heredoc(function(){/*!
                    <div class="resize-overlay"></div>
                */});

            //Set items resize left, width, top, height
            function setItemResize(dir, offset, resizeTarget, $boxs, boxs, element){
                var size, position, temp = {};
                var $last = $boxs.eq(boxs[resizeTarget.last].index);
                var $next = $boxs.eq(boxs[resizeTarget.next].index);
                var last = boxs[resizeTarget.last];
                var next = boxs[resizeTarget.next];

                if(dir === 'x'){
                    size = 'width';
                    position = 'left';
                }else{
                    size = 'height';
                    position = 'top';
                }

                last[size] = offset - parseFloat(last[position]) + '%';
                last.real[size] = parseFloat(last[size]) * last.supportRate;
                next[size] = parseFloat(next[position]) + parseFloat(next[size]) - offset + '%';
                next.real[size] = parseFloat(next[size]) * next.supportRate;
                temp[size] = last[size];
                $last.css(temp);
                temp = {};
                next[position] = temp[position] = offset + '%';
                element.css(temp);
                temp[size] = next[size];
                $next.css(temp);
            }
            //Set items in group resize left, width, top, height
            function setGroupResize(dir, offset, resizeTarget, $boxs, boxs, element){
                var size, position, temp = {};
                var $resizeBars = $boxs;

                if(dir === 'x'){
                    size = 'width';
                    position = 'left';
                }else{
                    size = 'height';
                    position = 'top';
                }

                resizeTarget.last.forEach(function(n){
                    var $item = $boxs.eq(boxs[n].index);
                    var item = boxs[n];
                    item[size] = offset - parseFloat(item[position]) + '%';
                    item.real[size] = parseFloat(item[size]) * item.mainRate;
                    temp = {};
                    temp[size] = item[size];
                    $item.css(temp);
                    $resizeBars.eq(item.resizeBarIndex).css(temp);
                });
                resizeTarget.next.forEach(function(n){
                    var $item = $boxs.eq(boxs[n].index);
                    var item = boxs[n];
                    item[size] = parseFloat(item[position]) + parseFloat(item[size]) - offset + '%';
                    item.real[size] = parseFloat(item[size]) * item.mainRate;
                    temp = {};
                    temp[position] = offset + '%';
                    temp[size] = item[size];
                    $item.css(temp);
                    $resizeBars.eq(item.resizeBarIndex).css(temp);
                    item[position] = temp[position];
                });

                temp = {};
                temp[position] = offset + '%';
                element.css(temp);
            }
            return {
                restrict: 'A',
                compile: function(){
                    return function(scope, element, attrs){

                        element.on('mousedown', function(e){
                            e.preventDefault();
                            var dir = element.hasClass('dir-h') ? 'y' : 'x';
                            var $resizeMark = angular.element(resizeMarkTpl);
                            var $resizeOverlay = angular.element(resizeOverlayTpl);
                            var $parent = element.parent();
                            var pRect = $parent[0].getBoundingClientRect();
                            var rect = element[0].getBoundingClientRect();
                            var relative;

                            if(dir === 'x'){
                                relative = e.clientX - pRect.left;
                                $resizeMark.css({
                                    top: rect.top - pRect.top + 'px',
                                    left: rect.left - pRect.left + 'px',
                                    width: '1px',
                                    height: rect.height + 'px'
                                });
                            }else{
                                relative = e.clientY - pRect.top;
                                $resizeMark.css({
                                    top: rect.top - pRect.top + 'px',
                                    left: rect.left - pRect.left + 'px',
                                    width: rect.width + 'px',
                                    height: '1px'
                                });
                            }

                            $parent.append($resizeMark).append($resizeOverlay);

                            $parent.on('mousemove', function(e){
                                var point = {
                                    x: e.clientX - pRect.left,
                                    y: e.clientY - pRect.top
                                };
    //                             var resizeTarget = element.data('resizeTarget');

                                $resizeMark.css(dir === 'x' ? {left: point.x + 'px'} : {top: point.y + 'px'});
                            });

                            $parent.on('mouseup', function(e){
                                $resizeMark.remove();
                                $resizeOverlay.remove();
                                $parent.off('mousemove');
                                $parent.off('mouseup');
                                resize(element, dir, pRect, {
                                    x: e.clientX - pRect.left,
                                    y: e.clientY - pRect.top
                                });
                            });
                        });

                        function resize(element, dir, pRect, point){
                            var resizeTarget = element.data('resizeTarget');
                            var $boxs = element.parent().children();
                            var left = point.x * 100/pRect.width;
                            var top = point.y * 100/pRect.height;

                            if(typeof resizeTarget.last === 'string'){
                                //resizeBar的目标是item
                                setItemResize(dir, dir === 'x' ? left : top, resizeTarget, $boxs, scope.boxs, element);
                            }else{
                                //resizeBar的目标是group
                                setGroupResize(dir, dir === 'x' ? left : top, resizeTarget, $boxs, scope.boxs, element);
                            }
                        }
                    };
                }
            };
        }
    ])

    .directive('codeEditor', 
    [
        function(){
            CodeMirror.modeURL = '/lib/codemirror/4.7/mode/%N/%N.js';
            
            return {
                restrict: 'A',
                compile: function(){
                    return function(scope, element, attrs){
                        if(CodeMirror){
                            var keys = attrs.ngModel.split('.');
                            var userSave = false;
                            var config = scope[attrs.codeEditor];

                            var cm = CodeMirror.fromTextArea(element[0], {
                                mode: config.mode,
                                lineNumbers: false,
                                value: element[0],
                                extraKeys: {
                                    'Ctrl-S': function(cm){
                                        cm.save();
                                    }
                                }
                            });
                            
                            require(['cm/mode/' + config.mode + '/' + config.mode], function(){
                                cm.setOption('mode', config.mode);
                            });

                            cm.setSize('100%', '100%');

                            scope.$watch(attrs.ngModel, function(newValue, oldValue){
                                if(!userSave){
                                    newValue && newValue !== oldValue && cm.doc.setValue(newValue);
                                }else{
                                    userSave = false;
                                }
                            });

                            cm.on('keyHandled', function(cm, name, e){
                                if(name === 'Ctrl-S'){
                                    e.preventDefault();
                                    userSave = true;
                                    //TODO
                                    scope[keys[0]][keys[1]] = cm.doc.getValue();
                                    config.save(e);
                                }
                            });

                            cm.on('blur', function(cm){
                                scope[keys[0]][keys[1]] = cm.doc.getValue();
                            });
                        }
                    }
                }
            };
        }
    ]);
});