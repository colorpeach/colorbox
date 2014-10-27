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
['$q', 'prompt',
    function($q,   prompt){
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
                "<div class='alert-box "+className+" animate-enter' ng-animate=\"'animate'\">"+
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
                $item.addClass('animate-leave');
                $timeout(function(){
                    $item.remove();
                },600);
                showQueue.shift();
                if(!showQueue.length){
                    boxTimeout = $timeout(function(){
                        box[0].style.display = 'block';
                        boxTimeout=null;
                    },600);
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

.directive('viewLink',
[
    function(){
        return {
            restrict: 'A',
            compile: function(_element, _attrs){
                var href = _element.attr('href');
                _element.attr('href', '#' + href);
            }
        };
    }
]);