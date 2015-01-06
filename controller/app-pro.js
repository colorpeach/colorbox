var apps = require('../models/app-pro');
var baseRes = require('./baseResponse');
var Apps = {};

Apps.get = function(req, res){
    apps.query(req.query, function(data){
        res.end(baseRes({app: data[0]}));
    });
};

Apps.add = function(req, res){
    apps.query({name: req.body.name},function(list){
        if(list.length){
            res.end(baseRes({errorMsg: ['应用已经存在']}));
        }else{
            req.body.user = req.session.user.login;
            req.body.createDate = new Date();
            
            apps.add(req.body, function(data){
                res.end(baseRes({app: data[0]}));
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

Apps.get_user_apps = function(req, res){
    apps.query({user: req.session.user.login}, function(list){
        res.end(baseRes({apps: list}));
    },{files: 0});
};

Apps.get_published_apps = function(req, res){
    //拼接模糊查询
    var param = {};
    var opera = {};
    opera.sort = {};
    req.query.name && (param.name = new RegExp(req.query.name));
    req.query.sort && (opera.sort[req.query.sort] = -1);
    req.query.skip && (opera.skip = req.query.skip * req.query.limit);
    req.query.limit && (opera.limit = +req.query.limit || 8);

    apps.query(param, function(list){
        res.end(baseRes({apps: list}));
    }, {files: 0}, opera);
};

Apps.get_app_item = function(req, res){
    var data = req.query;

    data.search = {
        'files.id': +data.id
    };

    apps.queryItem(data,function(data){
        res.end(baseRes({node:data[0].list}));
    });
};

Apps.get_app_items = function(req,res){
    apps.query(req.query,function(list){
        res.end(baseRes({nodes:list[0]}));
    },{'files.content':0});
};

Apps.post_add_app_item = function(req,res){
    apps.addItem(req.body,function(data){
        res.end(baseRes(data));
    });
};

Apps.post_update_app_item = function(req,res){
    apps.updateItem(req.body,function(data){
        res.end(baseRes({node:data[0]}));
    });
};

Apps.post_del_app_item = function(req,res){
    apps.deleteItem(req.body,function(){
        res.end(baseRes({}));
    });
};

Apps.static_file = function(req, res){
    var data = {
        user: req.params.user,
        name: req.params.app
    };
    var filePath = '/' + req.url.split('/').slice(4).join('/');

    data.search = {
        'files.url': filePath
    };

    apps.queryItem(data, function(data){
        if(data.length){
            res.end(data[0].files.content);
        }else{
            res.statusCode = 401;
            res.render('views/not-found',{user:req.session.user});
        }
    });
};

Apps.preview = function(req, res){
    var data = {
        _id: req.params.id
    };

    apps.query(data, function(data){
        if(data.length === 1){
            var url = ['', 'application', data[0].user, data[0].name + data[0].entrance].join('/');
            res.redirect(url);
        }else{
            res.statusCode = 401;
            res.render('views/not-found',{user:req.session.user});
        }
    });
};

module.exports = Apps;