var messages = require('../models/messages');
var baseRes = require('./baseResponse');

module.exports = {
    //添加留言
    '/add/message':{
        post:function(){
            return function(req,res,next){
                req.body.user = req.session.user.login;
                req.body.date = new Date();

                messages.add(req.body,function(data){
                    res.end(baseRes({message: data[0]}));
                });
            }
        }
    },
    //回复留言
    '/save/message':{
        post:function(){
            return function(req,res,next){
                var user = req.session.user.login;
                var data = req.body.responses[req.body.responses.length - 1];

                data.user = user;
                data.date = new Date();

                messages.update(req.body, function(data){
                    res.end(baseRes({responses: req.body.responses}));
                });
            }
        }
    },
    //获取留言
    '/_get/messages':{
        get:function(){
            return function(req,res,next){
                messages.query({}, function(list){
                    res.end(baseRes({messages: list}));
                },null,{sort:{"date":-1}});
            }
        }
    }
}