var snippets = require('../models/snippets');
var baseRes = require('./baseResponse');
var jade = require('jade');
var less = require('less');
var _snippets = {};

_snippets.snippets_preview = function(req, res){
    snippets.query({_id: req.params.id}, function(data){
        try{
            var appData = extend({css: {}, html: {}, javascript: {}}, data[0]);
            var html = jade.renderFile('client/template/app-preview.jade', appData);

            var css = appData.css.content || '';
            var body = appData.html.content || '';
            var js = appData.javascript.content || '';

            if(appData.css.type === 'less'){
                less.render(css, function(err, _css){
                    if(err){
                        res.end('error: \n' + err);
                    }
                    css = _css;
                });
            }
            if(appData.html.type === 'jade'){
                body = jade.render(body);
            }

            html = html.replace('<style>', '<style>' + (css || ''))
                        .replace('<body>', '<body>' + body)
                        .replace('<script>', '<script>' + (js || ''));
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
    },{html: 0, css: 0, js: 0});
};

_snippets.get_snippets = function(req, res){
    snippets.query({}, function(list){
        res.end(baseRes({snippets: list}));
    },{html: 0, css: 0, js: 0});
};

function extend(first, second){
    for(var n in second){
        first[n] = second[n];
    }
    return first;
}

module.exports = _snippets;