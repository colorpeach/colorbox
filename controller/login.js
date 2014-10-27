var user = require('../models/user');
var baseRes = require('./baseResponse');
var login = {};

//用户登录
login.enter = function(req,res){
    user.query(req.body,function(list){
        if(list.length){
            req.session.user = list[0];
            res.end(baseRes());
        }else{
            res.end(baseRes({errorMsg:['用户名或密码不正确']}));
        }
    });
};

//用户注销
login.out = function(req,res){
    req.session.destroy(function(){
        res.redirect(req.headers.referer||'/');
    });
};

//用户注册
login.register = function(req,res){
    user.query({username:req.body.username},function(list){
        if(list.length){
            res.end(baseRes({errorMsg:['用户已存在']}));
        }else{
            user.add(req.body,function(data){
                req.session.user = data[0];
                res.end(baseRes());
            });
        }
    });
}

module.exports = login;