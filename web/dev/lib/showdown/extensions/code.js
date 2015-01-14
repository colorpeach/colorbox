//
//  code highlight
//  A showdown extension to add code highlight
//  hints to showdown's HTML output.
//

(function(){
    var div = document.createElement('div');
    div.style.height = '400px';
    div.style.width = '400px';
    div.style.position = 'fixed';
    div.style.top = 0;
    div.style.left = '-100%';

    document.body.appendChild(div);

    var cache = {
        flow: {},
        sequence: {}
    };
    var Diagram;
    var flowchart;

    var code = function(converter) {
        return [
            { type: 'output', filter: function(source){
                return source.replace(/<code class="(.+)">([\S\s]*?)<\/code>/g, function(match, type, code) {
                    if(type === 'sequence'){
                        if(!Diagram){
                            require(['sequence-diagram'], function(d){ Diagram = d;});
                        }else{
                            var key = angular.toJson(code);
                            if(key in cache.sequence){
                                cache.sequence[key].store = true;
                                return cache.sequence[key].content;
                            }else{
                                var diagram = Diagram.parse(code);
                                div.innerHTML = '';
                                diagram.drawSVG(div);
                                //以文本为键，缓存绘制好的图像
                                cache.sequence[key] = {
                                    content: div.innerHTML,
                                    store: true
                                }
                                return div.innerHTML;
                            }
                        }

                            //删除不再需要的缓存
                            for(var n in cache.sequence){
                                if(!cache.sequence[n].store)
                                    delete cache.sequence[n];
                            }
                    }else if(type === 'flow'){
                        if(!flowchart){
                            require(['flowchart'], function(f){ flowchart = f;});
                        }else{
                            var key = angular.toJson(code);
                            if(key in cache.flow){
                                cache.flow[key].store = true;
                                return cache.flow[key].content;
                            }else{
                                var diagram = flowchart.parse(code);
                                div.innerHTML = '';
                                diagram.drawSVG(div);
                                //以文本为键，缓存绘制好的图像
                                cache.flow[key] = {
                                    content: div.innerHTML,
                                    store: true
                                }
                                return div.innerHTML;
                            }
                        }

                        //删除不再需要的缓存
                        for(var n in cache.flow){
                            if(!cache.flow[n].store)
                                delete cache.flow[n];
                        }
                    }else{
                        if(typeof hljs !== 'undefined'){
                            require(['highlight']);
                        }else{

                        }
//                         require(['highlight'], function(highlight){
//                             angular.forEach($code, function(n){
//                                 hljs.highlightBlock(n);
//                             });
//                         });
                    }

                    return match;
                });
            }}
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.code = code; }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = code;

}());