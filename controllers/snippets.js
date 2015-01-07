var snippets = require('../models/snippets');
var baseRes = require('./baseResponse');
var snippet = require('../utils/snippet');

module.exports = {
    //片段预览页面
    '/_snippets/preview/:id':{
        get:function(){
            return function(req,res,next){
                snippets.query({_id: req.params.id}, function(data){
                    var defaultData = {
                        html: {type: 'html', heads: [""]},
                        css: {type: 'css', libs: [], externals: [""]},
                        javascript: {type: 'javascript', libs: [], externals: [""]}
                    }
                    var appData = extend(defaultData, data[0]);
                    var html = snippet(appData);

                    res.end(html, 'utf-8');
                });
            }
        }
    },
    //获取片段
    '/get/snippet':{
        get:function(){
            return function(req,res,next){
                snippets.query(req.query, function(data){
                    res.end(baseRes({snippet: data[0]}));
                });
            }
        }
    },
    //添加片段
    '/add/snippet':{
        post:function(){
            return function(req,res,next){
                snippets.query({name:req.body.name}, function(list){
                    if(list.length){
                        res.end(baseRes({errorMsg:['代码片段已经存在']}));
                    }else{
                        req.body.user = req.session.user.login;;

                        snippets.add(req.body, function(data){
                            res.end(baseRes({snippet: data[0]}));
                        });
                    }
                });
            }
        }
    },
    //fork代码片段
    '/add/snippets-fork':{
        post:function(){
            return function(req,res,next){
                snippets.query(req.body, function(list){
                    if(!list.length){
                        res.end(baseRes({errorMsg:['代码片段不存在']}));
                    }else{
                        var data = {};
                        data.css = list[0].css;
                        data.html = list[0].html;
                        data.name = list[0].name;
                        data.fork = list[0].user;
                        data.description = list[0].description;
                        data.javascript = list[0].javascript;
                        data.user = req.session.user.login;;

                        snippets.add(data, function(data){
                            res.end(baseRes({snippet: data[0]}));
                        });
                    }
                });
            }
        }
    },
    //更新片段
    '/save/snippet':{
        post:function(){
            return function(req,res,next){
                snippets.update(req.body, function(){
                    res.end(baseRes());
        });
}
        }
    },
    //删除片段
    '/del/snippet':{
        post:function(){
            return function(req,res,next){
                snippets.del(req.body, function(){
                    res.end(baseRes());
                });
            }
        }
    },
    //获取用户的所有片段
    '/_get/user/snippets':{
        get:function(){
            return function(req,res,next){
                snippets.query({user: req.session.user.login}, function(list){
                    res.end(baseRes({snippets: list}));
                },{html: 0, css: 0, js: 0});
            }
        }
    },
    //获取所有片段
    '/_get/snippets':{
        get:function(){
            return function(req,res,next){
                snippets.query({}, function(list){
                    res.end(baseRes({snippets: list}));
                },{html: 0, css: 0, js: 0});
            }
        }
    },
    //模糊检索所有片段
    '/_get/snippets/fuzzy':{
        get:function(){
            return function(req,res,next){
                //拼接模糊查询
                var param = {};
                var opera = {
                    limit: 8
                };
                opera.sort = {};
                req.query.name  && (param.name = new RegExp(req.query.name));
                req.query.sort  && (opera.sort[req.query.sort] = -1);
                req.query.skip  && (opera.skip = req.query.skip * 8);
                req.query.limit && (opera.limit = +req.query.limit)

                snippets.query(param, function(list){
                    res.end(baseRes({snippets: list}));
                }, {jade: 0, css: 0, js: 0}, opera);
            }
        }
    }
}

function isObject(value){return value != null && typeof value == 'object';}

function extend(first, second){
    for(var n in second){
        if(isObject(second[n]) && isObject(first[n])){
            extend(first[n], second[n]);_get/snippets
        }else{
            first[n] = second[n];
        }
    }
    return first;
}