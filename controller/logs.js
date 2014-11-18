var logs = require('../models/logs');
var baseRes = require('./baseResponse');
var Showdown = require('showdown');
var converter = new Showdown.converter();
var _logs = {};

_logs.index = function(req, res){
    logs.query({}, function(list){
        list.forEach(function(n, i){
            n.content = converter.makeHtml(n.content);
        });
        res.render('public/logs', {
            user: req.session.user,
            logs: list
        });
    })
};

_logs.get = function(req, res){
    logs.query({}, function(list){
        list.forEach(function(n, i){
            n.content = converter.makeHtml(n.content);
        });
        res.end(baseRes({logs: list}));
    })
};

_logs.add = function(req, res){
    if(req.session.user && req.session.user.admin){
        req.body.date = new Date();

        logs.add(req.body, function(){
            res.end('修改成功');
        });
    }else{
        res.end('你没有权限', 'utf-8');
    }
};

module.exports = _logs;