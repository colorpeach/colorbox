var snippets = require('../models/snippets');
var baseRes = require('./baseResponse');
var jade = require('jade');
var less = require('less');
var _snippets = {};
var snippet = require('../utils/snippet');

_snippets.snippets_preview = function(req, res){
    snippets.query({_id: req.params.id}, function(data){
        var defaultData = {
                html: {type: 'html', heads: [""]},
                css: {type: 'css', libs: [], externals: [""]},
                javascript: {type: 'javascript', libs: [], externals: [""]}
            }
        var appData = extend(defaultData, data[0]);
        var html = snippet(appData);

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
            
            snippets.add(snippets,req.body, function(data){
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

function isObject(value){return value != null && typeof value == 'object';}

function extend(first, second){
    for(var n in second){
        if(isObject(second[n]) && isObject(first[n])){
            extend(first[n], second[n]);
        }else{
            first[n] = second[n];
        }
    }
    return first;
}

module.exports = _snippets;