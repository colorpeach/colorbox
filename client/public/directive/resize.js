define(['angular'], function(){
    angular.module('components', [])

/*
*@param resizeBox {Array}
*
*{
    dir: 'v'
    items: [
        {
            template: '',
            hide: false,
            real: {
                x: 0,
                y: 0
            },
            show: {
                x: 0,
                y: 0
            }
        }
    ]
}
*
*/
    .directive('resizeBox',
    ['$templateCache',
        function($templateCache){
            var itemTpl = '<div>{0}</div>';
            var resizeBarTpl = '<div resize-bar></div>';

            return {
                restrict: 'A',
                compile: function(){
                    return function(scope, element, attrs){
                        var config = function(scope, key){
                            var current = scope;
                            var value;
                            while(current && angular.isDefined(value = scope[key])){
                                current = current.$parent();
                            }
                            return value;
                        }(scope, attrs.resizeBox);
                        var $resizeBars = angular.element(Array(config.items.length - 1).join(resizeBarTpl));

                        //填充html
                        element.html(
                            config.items.concat.apply([], config.items)
                            .map(function(n, i){
                                var template = $templateCache.get(n.template) || n.template;
                                itemTpl.replace(/\{\d+\}/, template);
                            }).join('')
                        );
                        element.append($resizeBars);

                        function toggleResizeItem(){

                        }

                        function updateView(){

                        }

                    };
                }
            };
        }
    ])

    .directive('resizeBar',
    ['$rootScope',
        function($rootScope){
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
                        element.on(eventsMap[device].down, function(e){
                            e.preventDefault();
                            var dir = element.hasClass('dir-h') ? 'y' : 'x';
                            var $resizeMark = angular.element(resizeMarkTpl);
                            var $resizeOverlay = angular.element(resizeOverlayTpl);
                            var $parent = element.parent();
                            var pRect = $parent[0].getBoundingClientRect();
                            var rect = element[0].getBoundingClientRect();
                            var relative;
                            var point = {
                                x: (e.touches ? e.touches[0].clientX : e.clientX) - pRect.left,
                                y: (e.touches ? e.touches[0].clientY : e.clientY) - pRect.top
                            };

                            if(dir === 'x'){
                                relative = point.x;
                                $resizeMark.css({
                                    top: rect.top - pRect.top + 'px',
                                    left: 5 + rect.left - pRect.left + 'px',
                                    width: '1px',
                                    height: rect.height + 'px'
                                });
                            }else{
                                relative = point.y;
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

                                $resizeMark.css(dir === 'x' ? {left: point.x + 'px'} : {top: point.y + 'px'});
                            });

                            $parent.on(eventsMap[device].up, function(e){
                                $resizeMark.remove();
                                $resizeOverlay.remove();
                                $parent.off(eventsMap[device].move);
                                $parent.off(eventsMap[device].up);
                                resize(element, dir, pRect, point);
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

                            $rootScope.$broadcast('resizeBarResize');
                        }
                    };
                }
            };
        }
    ])
});