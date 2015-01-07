var apps = require('../models/app-pro');
var baseRes = require('./baseResponse');

module.exports = {
    //获取应用
    '/get/app-pro':{
        get:function(){
            return function(req,res,next){
                apps.query(req.query, function(data){
                    res.end(baseRes({app: data[0]}));
                })
            };
        }
    },
    //添加应用
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
    //更新应用
    '/save/app-pro':{
        post:function(){
            return function(req,res,next){
                apps.update(req.body, function(){
                    res.end(baseRes());
                });
            };

        }
    },
    //删除应用
    '/del/app-pro':{
        post:function(){
            return function(req,res,next){
                apps.del(req.body, function(){
                    res.end(baseRes());
                });
            };

        }
    },
    //获取用户的所有应用
    '/get/user/app-pro':{
        get:function(){
            return function(req,res,next){
                apps.query({user: req.session.user.login}, function(list){
                    res.end(baseRes({apps: list}));
                },{files: 0});
            }
        }
    },
    //获取发布的应用
    '/_get/published/app-pros':{
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

                apps.operaQuery(param, function(list){
                    res.end(baseRes({apps: list}));
                }, {files: 0}, opera);
            }
        }
    },
    //获取文件内容
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
    //获取文件
    '/get/app-pro/items':{
        get:function(){
            return function(req,res,next){
                apps.query(req.query,function(list){
                    res.end(baseRes({nodes:list[0]}));
                },{'files.content':0});
            }
        }
    },
    //添加文件
    '/add/app-pro/item':{
        post:function(){
            return function(req,res,next){
                apps.addItem(req.body,function(data){
                    res.end(baseRes(data));
                });
            }
        }
    },
    //添加更新
    '/save/app-pro/item':{
        post:function(){
            return function(req,res,next){
                apps.updateItem(req.body,function(data){
                    res.end(baseRes({node:data[0]}));
                });
            }
        }
    },
    //删除文件
    '/del/app-pro/item':{
        post: function () {
            return function(req,res,next){
                apps.deleteItem(req.body,function(){
                    res.end(baseRes({}));
                });
            }
        }
    },
    //应用文件页
    '/application/:user/:app/*':{
        get:function(){
            return function(req,res,next){
                var data = {
                    user: req.params.user,
                    name: req.params.app
                };
                var filePath = '/' + req.url.split('/').slice(4).join('/');

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
    },
    //应用预览页面
    '/_app-pro/preview/:id':{
        get:function(){
            return function(req,res,next){
                var data = {
                    _id: req.params.id
                };

                apps.query(data, function(data){
                    if(data.length === 1){
                        var url = ['', 'application', data[0].user, data[0].name + data[0].entrance].join('/');
                        res.redirect(url);
                    }else{
                        res.statusCode = 401;
                        res.render('views/not-found',{user:req.session.user});
                    }
                });
            }
        }
    }
}