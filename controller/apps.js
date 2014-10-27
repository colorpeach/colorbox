var apps = require('../models/apps');
var baseRes = require('./baseResponse');
var Apps = {};

Apps.add = function(req, res){
    apps.query({name:req.body.name},function(list){
        if(list.length){
            res.end(baseRes({errorMsg:['app已经存在']}));
        }else{
            var data = {};
            data.user = req.session.user.login;
            data.name = req.body.name;
            
            apps.add(data,function(data){
                res.end(baseRes());
            });
        }
    });
}

Apps.save = function(req, res){
    apps.update(req.body, function(err){
        if(!err){
            res.end(baseRes());
        }else{
            res.end(baseRes({errorMsg:[err]}));
        }
    });
};

Apps.getApps = function(req, res){
    apps.query({user: req.session.user.login}, function(list){
        res.end(baseRes({apps: list}));
    },{jade: 0, css: 0, js: 0});
}

module.exports = Apps;