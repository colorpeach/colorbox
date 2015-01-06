var logs = require('../models/logs');
var baseRes = require('./baseResponse');

module.exports = {
    '/_logs':{
        get:function(){
            return function(req,res,next){
                logs.query({}, function(list){
                    list.forEach(function(n, i){
                        n.content = converter.makeHtml(n.content);
                    });
                    res.render('public/logs', {
                        user: req.session.user,
                        logs: list
                    });
                })
            }
        }
    },
    '/_get/logs':{
        get:function(){
            return function(req,res,next){
                logs.query({}, function(list){
                    list.forEach(function(n, i){
                        n.content = converter.makeHtml(n.content);
                    });
                    res.end(baseRes({logs: list}));
                }, null, {sort:{"date":-1}})
            }
        }
    },
    '/add/log':{
        post:function(){
            return function(req,res,next){
                if(req.session.user && req.session.user.admin){
                    req.body.date = new Date();

                    logs.add(req.body, function(){
                        res.end('修改成功');
                    });
                }else{
                    res.end('你没有权限', 'utf-8');
                }
            }
        }
    }
}