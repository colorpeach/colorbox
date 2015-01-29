var logs = require('../models/logs');
var baseRes = require('./baseResponse');
var Showdown = require('showdown');
var converter = new Showdown.converter();

module.exports = {
    //网站日志
    '/_logs':{
        get:function(){
            return function(req,res){
                logs.query({}, function(list){
                    list.forEach(function(n){
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
    //获取网站日志
    '/_get/logs':{
        get:function(){
            return function(req,res){
                logs.query({}, function(list){
                    list.forEach(function(n){
                        n.content = converter.makeHtml(n.content);
                    });
                    res.end(baseRes({logs: list}));
                }, null, {sort:{"date":-1}})
            }
        }
    },
    //添加网站日志
    '/add/log':{
        post:function(){
            return function(req,res){
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
};