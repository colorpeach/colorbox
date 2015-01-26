var articles = require('../models/articles');
var baseRes = require('./baseResponse');

module.exports = {
    //获取文档
    '/_get/article':{
        get:function(){
            return function(req, res){
                articles.query(req.query, function(data){
                    res.end(baseRes({article: data[0]}));
                })
            };
        }
    },
    '/get/article-list/user': {
        get: function(){
            return function(req, res){
                articles.query({user: req.session.user.login}, function(list){
                    res.end(baseRes({articles: list}));
                },{content: 0});
            }
        }
    },
    '/_get/article-published': {
        get: function(){
            return function(req, res){
                //拼接模糊查询
                var param = {};
                var opera = {};
                opera.sort = {};
                req.query.name && (param.name = new RegExp(req.query.name));
                req.query.sort && (opera.sort[req.query.sort] = -1);
                req.query.skip && (opera.skip = req.query.skip * req.query.limit);
                req.query.limit && (opera.limit = +req.query.limit || 8);
                param.public = true;

                articles.query(param, function(list){
                    res.end(baseRes({articles: list}));
                }, {content: 0}, opera);
            }
        }
    },
    //添加文档
    '/add/article': {
        post: function(){
            return function(req, res){
                if(req.body.name){
                    articles.query({name: req.body.name},function(list){
                        if(list.length){
                            res.end(baseRes({errorMsg: ['文档已经存在']}));
                        }else{
                            add();
                        }
                    });
                }else{
                    //文档名可以为空
                    add();
                }

                function add(){
                    req.body.user = req.session.user.login;

                    articles.add(req.body, function(data){
                        res.end(baseRes({article: data[0]}));
                    });
                }
            }
        }
    },
    //保存文档
    '/save/article': {
        post:function(){
            return function(req, res){
                articles.update(req.body, function(){
                    res.end(baseRes());
                });
            };
        }
    },
    //删除文档
    '/del/article': {
        post:function(){
            return function(req, res){
                articles.del(req.body, function(){
                    res.end(baseRes());
                });
            };
        }
    }
};