var snippets = require('../models/snippets');
var baseRes = require('./baseResponse');
var jade = require('jade');
var _snippets = {};

_snippets.snippets_preview = function(req, res){
    snippets.query({_id: req.params.id}, function(data){
        try{
            var appData = data[0];
            var html = jade.renderFile('client/template/app-preview.jade', appData);
            var body = appData.jade ? jade.render(appData.jade) : '';

            html = html.replace('<style>', '<style>' + (appData.css || ''))
                        .replace('<body>', '<body>' + body)
                        .replace('<script>', '<script>' + (appData.js || ''));
        }catch(e){
            var html = 'error: \n' + e.message;
        }
        res.end(html, 'utf-8');
    });
};

_snippets.get = function(req, res){
    snippets.query(req.query, function(data){
        res.end(baseRes({snippet: data[0]}));
    });
};

_snippets.add = function(req, res){
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
};

_snippets.save = function(req, res){
    snippets.update(req.body, function(){
        res.end(baseRes());
    });
};

_snippets.del = function(req, res){
    snippets.del(req.body, function(){
        res.end(baseRes());
    });
};

_snippets.get_user_snippets = function(req, res){
    snippets.query({user: req.session.user.login}, function(list){
        res.end(baseRes({snippets: list}));
    },{jade: 0, css: 0, js: 0});
};

module.exports = _snippets;