define(['angular'], function(){
    angular.module('common', [])

    .config(
    ['$httpProvider',
        function($httpProvider){
            $httpProvider.interceptors.push('promptInterceptor');
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
    ['$q', 'prompt', '$rootScope',
        function($q,   prompt,   $rootScope){
            return {
                response: function success(d){
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
                    $rootScope.removeLoad();
                    return d;
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
                    className = "info";
                    break;
                case "warning":
                    className = "warning";
                    break;
                case "danger":
                    className = "alert";
                    break;
            }

            return "<div>" +
                    "<div class='alert-box "+className+" animated ng-enter'>"+
                        "<strong>"+(obj.title||"")+"</strong>"+obj.content+
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
        box = angular.element("<div class='prompt-box'></div>"),
        prompt = function(options){
            if(!document.querySelectorAll(".prompt-box").length){
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
            return function(target,attachment,options){
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
                            left:offset.right + tipW +arrowGap,
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
                    
                    return function(scope,element,attrs){
                        var tip = tipDom;
                        var title = attrs.title;
                        
                        element.removeAttr('title');
                        
                        element.bind('mouseenter',function(){
                            
                            tip.removeClass('hide');
                            tip.children().eq(1).text(attrs.title)

                            if(attrs.tip === 'l'){
                                fixed(element, tip, {dir: 'l'});
                                tip.children().eq(0).addClass('cm-tip-arrow-left');
                            }else{
                                fixed(element, tip);
                                tip.children().eq(0).removeClass('cm-tip-arrow-left');
                            }
                        });
                        
                        element.bind('mouseleave',function(){
                            tip.addClass('hide');
                        })
                    }
                }
            }
        }
    ])

    .directive('dialog',
    ['utils',
        function(utils){
            return {
                restrict: 'A',
                scope: {},
                template: utils.heredoc(function(){/*!
                    <div class="reveal-modal-bg"></div>
                        <div class="reveal-modal" ng-show="">
                        </div>
                    </div>
                */}),
                compile: function(){

                }
            }
        }
    ]);
    
});