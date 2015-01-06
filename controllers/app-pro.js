var apps = require('../models/app-pro');
var baseRes = require('./baseResponse');

module.exports = {
    '/get':{
        get:function(){
            return function(req,res,next){
                apps.query(req.query, function(data){
                    res.end(baseRes({app: data[0]}));
                })
            };
        }
    },
    '/add/app-pro':{
        post:function(){
            return function(req,res,next){
                apps.query({name: req.body.name},function(list){
                    if(list.length){
                        res.end(baseRes({errorMsg: ['应用已经存在']}));
                    }else{
                        req.body.user = req.session.user.login;
                        req.body.createDate = new Date();

                        apps.add(req.body, function(data){
                            res.end(baseRes({app: data[0]}));
                        });
                    }
                });
            };

        }
    },
    '/save/app-pro':{
        post:function(){
            return function(req,res,next){
                apps.update(req.body, function(){
                    res.end(baseRes());
                });
            };

        }
    },
    '/del/app-pro':{
        post:function(){
            return function(req,res,next){
                apps.del(req.body, function(){
                    res.end(baseRes());
                });
            };

        }
    },
    '/get/user/app-pro':{
        get:function(){
            return function(req,res,next){
                apps.query({user: req.session.user.login}, function(list){
                    res.end(baseRes({apps: list}));
                },{jade: 0, css: 0, js: 0});
            }
        }
    },
    '/_get/published/app-pro':{
        get:function(){
            return function(req,res,next){
                //拼接模糊查询
                var param = {};
                var opera = {
                    limit: 8
                };
                opera.sort = {};
                req.query.name && (param.name = new RegExp(req.query.name));
                req.query.sort && (opera.sort[req.query.sort] = -1);
                req.query.skip && (opera.skip = req.query.skip * 8);

                apps.operaQuery(param, function(list){
                    res.end(baseRes({apps: list}));
                }, {jade: 0, css: 0, js: 0}, opera);
            }
        }
    },
    '/get/app-pro/item':{
        get:function(){
            return function(req,res,next){
                var data = req.query;

                data.search = {
                    'files.id': +data.id
                };

                apps.queryItem(data,function(data){
                    res.end(baseRes({node:data[0].list}));
                });
            }
        }
    },
    '/get/app-pro/items':{
        get:function(){
            return function(req,res,next){
                apps.query(req.query,function(list){
                    res.end(baseRes({nodes:list[0]}));
                },{'files.content':0});
            }
        }
    },
    '/add/app-pro/item':{
        post:function(){
            return function(req,res,next){
                apps.addItem(req.body,function(data){
                    res.end(baseRes(data));
                });
            }
        }
    },
    '/save/app-pro/item':{
        post:function(){
            return function(req,res,next){
                apps.updateItem(req.body,function(data){
                    res.end(baseRes({node:data[0]}));
                });
            }
        }
    },
    '/del/app-pro/item':{
        post: function () {
            return function(req,res,next){
                apps.deleteItem(req.body,function(){
                    res.end(baseRes({}));
                });
            }
        }
    },
    '/application/:user/:app/*':{
        get:function(){
            return function(req,res,next){
                var data = {
                    user: req.params.user,
                    name: req.params.app
                };
                var filePath = req.url.replace('/application/' + data.user + '/' + data.name, '');

                data.search = {
                    'files.url': filePath
                };

                apps.queryItem(data, function(data){
                    if(data.length){
                        res.end(data[0].files.content);
                    }else{
                        res.statusCode = 401;
                        res.render('views/not-found',{user:req.session.user});
                    }
                });
            }
        }
    }
}