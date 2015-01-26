define(['angular'], function(){
    angular.module('common', [])

    .config(
    ['$httpProvider',
        function($httpProvider){
            $httpProvider.interceptors.push('promptInterceptor');
        }
    ])

    .factory('safeApply',
    ['$rootScope',
        function($rootScope){
            return function(fn) {
                var phase = $rootScope.$$phase;
                if(phase == '$apply' || phase == '$digest') {
                    if(fn && (typeof(fn) === 'function')) {
                        fn();
                    }
                }else {
                    this.$apply(fn);
                }
            };
        }
    ])

    .factory('storage',
    ['$window',
         function($window){

            var storage = (typeof $window.localStorage === 'undefined') ? undefined : $window.localStorage;
            var supported = !(typeof storage === 'undefined');
            var map = {};
            
            //https://github.com/agrublev/angularLocalStorage
            if (supported) {
                // When Safari (OS X or iOS) is in private browsing mode it appears as though localStorage
                // is available, but trying to call .setItem throws an exception below:
                // "QUOTA_EXCEEDED_ERR: DOM Exception 22: An attempt was made to add something to storage that exceeded the quota."
                var testKey = '__' + Math.round(Math.random() * 1e7);

                try {
                    localStorage.setItem(testKey, testKey);
                    localStorage.removeItem(testKey);
                }
                catch (err) {
                    supported = false;
                }
            }

            return {
                bind: function(scope, key, opts){
                    map[key] = scope;
                    scope[key] = angular.fromJson(storage.getItem(key)) || opts.defaultValue;
                    if(supported){
                        scope.$watch(key, function(val){
                            storage.setItem(key, angular.toJson(val));
                        });
                    }
                },
                update: function(key, value){
                    if(typeof value === 'undefined'){
                        storage.setItem(key, angular.toJson(map[key][key]));
                    }else{
                        storage.setItem(key, angular.toJson(value));
                    }
                }
            }
        }
    ])

    .factory('utils', function(){
        var docprefix = /^[^\/]+\/\*!\s*/;
        var docsuffix = /\s*\*\/[^\/]+$/;
        var format = /\{(\d+)\}/g;

        return {
            /*
            *
            */
            heredoc: function(f){
                return f.toString()
                        .replace(docprefix, '')
                        .replace(docsuffix, '');
            },
            format: function(tpl, args){
                return tpl.replace(format, function(m, d){
                    return args[d] || '';
                });
            }
        }
    })

    //拦截器
    .factory('promptInterceptor',
    ['$q', 'prompt', '$rootScope', '$location',
        function($q,   prompt,   $rootScope,   $location){
            return {
                response: function success(d){
                    if(!(angular.isString(d.data) && d.data[0] === '<')){
                        //请求非模板数据返回时，去除loading
                        $rootScope.removeLoad();
                    }
                    if(d.data.error){
    //                      prompt({
    //                         type:'danger',
    //                         content:d.data.errorMsg.map(function(n){return '<div>'+n+'</div>';})
    //                     });
                        return $q.reject(d);
                    }else{
                        if(d.data.successMsg){
    //                         prompt({
    //                             type: 'success',
    //                             content: d.data.successMsg.map(function(n){return '<div>'+n+'</div>';})
    //                         })
                        }
                    }
                    return d;
                },
                responseError: function(rejection){
                    if(rejection.status === 401){
                        //session失效
                        $rootScope.user = null;
                        $rootScope.$broadcast('clearStore');
                        $rootScope.backUrl = $location.url();
                        $location.path('/login');
                    }
                    $rootScope.removeLoad();

                    return $q.reject(rejection);
                }
            }
        }
    ])

    /**
     * @param options{
     *      type:String "warning", "info", "danager", "success"(default)
     *      title:String,
     *      content:String
     * }
     */
    .factory("prompt",
    ['$timeout',
        function($timeout){
            var template = function(obj){
            var className = "success";
            switch(obj.type){
                case "info":
                    className = "primary";
                    break;
                case "warning":
                    className = "warning";
                    break;
                case "danger":
                    className = "alert";
                    break;
            }

            return "<div>" +
                    "<div class='prompt__item--" + className + " animated ng-enter'>" +
                        "<strong>" + (obj.title || "") + "</strong>" + obj.content +
                    "</div>" +
                    "</div>";
        },
        queue = [],
        queueCount = 0,
        showQueue = [],
        boxTimeout,
        addSpan = 2000,
        removeSpan = 3000,
        max = 2,
        action = function(){
            var hasQueue = queue.length,
                opt;

            opt = queue.shift();
            hasQueue && queueCount++;

            if(opt){
                var $item = angular.element(template(opt));
                box.append($item);

                hasQueue && $timeout(function(){
                    action();
                },addSpan);

                showQueue.push($timeout(function(){
                    $item.children().addClass('ng-leave');
                    $timeout(function(){
                        $item.remove();
                    },1000);
                    showQueue.shift();
                    if(!showQueue.length){
                        boxTimeout = $timeout(function(){
                            box[0].style.display = 'block';
                            boxTimeout=null;
                        },1000);
                    }
                },removeSpan));
            }else{
                return;
            }
        },
        box = angular.element("<div class='prompt__box'></div>"),
        prompt = function(options){
            if(!document.querySelectorAll(".prompt__box").length){
                document.body.appendChild(box[0]);
            }

            if(!queue.length){
                if(boxTimeout){
                    $timeout.cancel(boxTimeout);
                    boxTimeout = null;
                }else{
                    box[0].style.display = 'block';
                }
                queue.push(options);
                action();
            }else{
                queue.push(options);
            }
        };

        prompt.clear = function(){
            queue = [];
            while(showQueue.length){
                $timeout.cancel(showQueue.unshift());
            }
        };

        return prompt;
    }])
    
    .factory('fixed',
    [
        function(){
            return function(target, attachment, options){
                var offset = target[0].getBoundingClientRect(),
                    tip = attachment,
                    tipRect = tip[0].getBoundingClientRect(),
                    arrowGap = 6,
                    css = {},
                    tipW,tipH,
                    opts = {
                        dir:'b',
                        x:0,
                        y:0
                    };

                angular.extend(opts,options);
                tipW = tipRect.right - tipRect.left;
                tipH = tipRect.bottom - tipRect.top;

                switch(opts.dir){
                    case 'l':
                        css = {
                            left:offset.left - tipW - arrowGap,
                            top:offset.top - tipH/2 + (offset.bottom - offset.top)/2
                        };
                        break;
                    case 'r':
                        css = {
                            left:offset.right + arrowGap,
                            top:offset.top - tipH/2 + (offset.bottom - offset.top)/2
                        };
                        break;
                    case 't':
                        css = {
                            left:offset.left - tipW/2 + (offset.right - offset.left)/2,
                            top:offset.top - arrowGap
                        };
                        break;
                    default:
                        css = {
                            left:offset.left - tipW/2 + (offset.right - offset.left)/2,
                            top:offset.bottom + arrowGap
                        };
                        break;
                }

                css.left += +opts.x||0;
                css.top += +opts.y||0;
                
                css.left += 'px';
                css.top += 'px';

                tip.css(css);
            }
        }
    ])

    //可设定数据类型： Array, Date, Number, Object, String, Defined
    .factory('DataList', 
    [
        function(){
            function DataList(columns){
                this.list = [];
                this.item = angular.extend({}, columns);
            }

            DataList.prototype = {
                constructor: DataList,
                setList: function(data){
                    var list = data.slice(0);
                    for(var i = 0, len = list.length; i < len; i++){
                        list[i] = generate(this.item, list[i]);
                    }
                    return this.list = list;
                },
                add: function(data){
                    this.list.push(generate(this.item, data));
                },
                remove: function(index){
                    this.list.splice(index, 1);
                },
                get: function(index){
                    return this.list[index];
                }
            };

            var errorTypes = ['Function', 'Element', 'Undefined'];
            //生成符合预定格式的数据
            function generate(format, data, source){
                var r = source || {};

                for(var n in format){
                    if(n in data){
                        var type = format[n];
                        if(angular['is' + type] && errorTypes.indexOf(type) < 0){
                            if(angular['is' + type](data[n])){
                                r[n] = data[n];
                            }else{
                                throw '字段：' + n + '类型错误';
                            }
                        }else if(type === 'Boolean'){
                            r[n] = !!data[n];
                        }else{
                            throw '类型未定义或类型错误';
                        }
                    }
                }

                return r;
            }

            return DataList;
        }
    ])

    .factory('data::store',
    ['data::crud', '$q', '$rootScope',
        function(crud,   $q,   $rootScope){
            var store = {};

            function main(mod, type, params){
                if(store[mod] && store[mod][type] && !params){
                    var deferred = $q.defer();
                    deferred.resolve(store[mod][type]);

                    deferred.promise.success = function(fun){
                        deferred.promise.then(function(data){
                            fun(data);
                        });
                        return deferred.promise;
                    }
                    
                    $rootScope.removeLoad();

                    deferred.promise.error = angular.noop;

                    return deferred.promise;
                }else{
                    return crud[mod][type](params).success(function(data){
                        if(!store[mod]) store[mod] = {};
                        store[mod][type] = data;
                    });
                }
            }

            main.get = function(mod, type, key){
                if(store[mod] && store[mod][type]){
                    if(key != undefined){
                        return store[mod][type][key];
                    }
                    return store[mod][type];
                };
            };

            main.set = function(mod, type, data){
                if(!store[mod]){
                    store[mod] = {};
                }
                store[mod][type] = data;
            };

            $rootScope.$on('clearStore', function(){
                store = {};
            });

            return main;
        }
    ])

    .directive('tip',
    ['fixed',
        function(fixed){
            var tipHTML = 
                '<div class="cm-tip hide">'
                    + '<div class="cm-tip-arrow"></div>'
                    + '<div class="cm-tip-content"></div>'
                 + '</div>';
            var tipDom = angular.element(tipHTML);

            angular.element(document.body).append(tipDom);

            return {
                restrict:'A',
                compile:function(){
                    
                    return function(scope, element, attrs){
                        var tip = tipDom;
                        var title = attrs.title;
                        
                        element.removeAttr('title');
                        
                        element.bind('mouseenter', function(e){
                            e.preventDefault();
                            var arrowClass = 'cm-tip-arrow-left';

                            tip.removeClass('hide');
                            tip.children()[0].className = '';
                            tip.children().eq(1).text(attrs.title);

                            switch(attrs.tip){
                                case 'l':
                                    arrowClass = 'cm-tip-arrow-left';
                                break;
                                case 't':
                                    arrowClass = 'cm-tip-arrow-top';
                                break;
                                case 'r':
                                    arrowClass = 'cm-tip-arrow-right';
                                break;
                                default:
                                    arrowClass = 'cm-tip-arrow-bottom';
                            }

                            fixed(element, tip, {dir: attrs.tip});
                            tip.children().eq(0).addClass(arrowClass + ' cm-tip-arrow');
                        });
                        
                        element.bind('mouseleave', function(){
                            tip.addClass('hide');
                        })
                    }
                }
            }
        }
    ])

    .directive('starBar',
    [
        function(){
            var fill = '<span class="icon-star3"></span>';
            var half = '<span class="icon-star2"></span>';
            var empty = '<span class="icon-star1"></span>';

            function updateScore(list, element){
                var score = 5;
                
                if(list && list.length){
                    if(list.length === 1){
                        score = list[0];
                    }else{
                        score = list.reduce(function(x, y){ return x + y;})/list.length
                    }
                }

                element.html(
                    //星值对应
                    //全星.7 ~ 1
                    //半星.31 ~ .69
                    //空星0 ~ .3
                    Array(Math.floor(score + 1.3)).join(fill)
                    + (score%1 > .3 && score%1 < .7 ? half : '')
                    + Array(Math.floor(6.3 - score )).join(empty)
                );
            }

            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    var map = scope[attrs.starBar];
                    var list = Object.keys(map || {});

                    updateScore(list, element);
                }
            };
        }
    ])

    .factory('toAnchor',
    ['$location',
        function($location){
            return function(anchor){
                return '#' + $location.url().split('#')[0] + anchor;
            }
        }
    ])

    .directive('anchor',
    ['toAnchor',
        function(toAnchor){
            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    element[0].href = toAnchor(scope.$eval(attrs.anchor));
                }
            };
        }
    ])

    .directive('srcElement',
    ['$sce',
        function($sce){
            var reg = /\{(.+)\}/;

            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    var url = attrs.srcElement;
                    var m = url.match(reg);

                    if(m){
                        scope.$watch(m[1], function(val){
                            val && element.attr('src', $sce.trustAsResourceUrl(url.replace(reg, val)));
                        });
                    }
                }
            };
        }
    ])

    //滚动加载
    .directive('scrollLoad',
    ['$timeout',
        function($timeout){
            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    var fn = scope[attrs.scrollLoad];
                    var timer = 0;

                    element.bind('scroll', function(){
                        if(timer){
                            $timeout.cancel(timer);
                        }

                        timer = $timeout(function(){
                            var height = element[0].getBoundingClientRect().height;
                            if(height + element[0].scrollTop >= element[0].scrollHeight -30){
                                fn();
                            }
                        }, 100);
                    });
                }
            };
        }
    ])

    //动态居中
    .directive('autoCenter',
    ['$window',
        function($window){
            function center($box, itemWidth, itemLength, boxWidth){
                var width = boxWidth;
                var paddingLeft = 0;

                if(width > itemLength * itemWidth){
                    paddingLeft = (width - itemLength * itemWidth) / 2;
                }else{
                    paddingLeft = (width % itemWidth) / 2;
                }

                $box.css({paddingLeft: paddingLeft + 'px'});
            }

            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    var itemWidth = parseFloat(attrs.autoCenter) || 243.2;
                    var oldWidth;

                    scope.$watch(attrs.autoCenterLength, function(val){
                        oldWidth = oldWidth || element[0].getBoundingClientRect().width;
                        center(element, itemWidth, val, oldWidth);
                    });

                    angular.element($window).on('resize', function(){
                        var itemLength = scope.$eval(attrs.autoCenterLength);
                        oldWidth = element[0].getBoundingClientRect().width;
                        center(element, itemWidth, itemLength, oldWidth);
                    });
                }
            };
        }
    ])

    //自动获取焦点
    .directive('autoFocus',
    ['$timeout',
        function($timeout){
            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    scope.$watch(attrs.autoFocus, function(val){
                        if(val){
                            $timeout(function(){
                                element[0].focus();
                                element[0].select();
                            }, 0);
                        }
                    });
                }
            };
        }
    ]);
    
});