var snippets = require('../models/snippets');
var baseRes = require('./baseResponse');

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
    }
}

function isObject(value){return value != null && typeof value == 'object';}

function extend(first, second){
    for(var n in second){
        if(isObject(second[n]) && isObject(first[n])){
            extend(first[n], second[n]);
        }else{
            first[n] = second[n];
        }
    }
    return first;
}