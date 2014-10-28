var apps = require('../models/apps');
var baseRes = require('./baseResponse');
var jade = require('jade');
var Apps = {};

Apps.apps_preview = function(req, res){
    apps.query({_id: req.params.id}, function(data){
        var appData = data[0];
        var html = jade.renderFile('client/template/app-preview.jade', appData);
        var body = appData.jade ? jade.render(appData.jade) : '';

        html = html.replace('<style>', '<style>' + (appData.css || ''))
                    .replace('<body>', '<body>' + body)
                    .replace('<script>', '<script>' + (appData.js || ''));
        res.end(html, 'utf-8');
    });
};

Apps.get = function(req, res){
    apps.query(req.query, function(data){
        res.end(baseRes({app: data[0]}));
    });
};

Apps.add = function(req, res){
    apps.query({name:req.body.name},function(list){
        if(list.length){
            res.end(baseRes({errorMsg:['app已经存在']}));
        }else{
            var data = {};
            data.user = req.session.user.login;
            data.name = req.body.name;
            
            apps.add(data,function(data){
                res.end(baseRes(data));
            });
        }
    });
};

Apps.save = function(req, res){
    apps.update(req.body, function(){
        res.end(baseRes());
    });
};

Apps.del = function(req, res){
    apps.del(req.body, function(){
        res.end(baseRes());
    });
};

Apps.get_apps = function(req, res){
    apps.query({user: req.session.user.login}, function(list){
        res.end(baseRes({apps: list}));
    },{jade: 0, css: 0, js: 0});
};

Apps.get_published_apps = function(req, res){
    apps.query(req.query, function(list){
        res.end(baseRes({apps: list}));
    },{jade: 0, css: 0, js: 0});
};

module.exports = Apps;