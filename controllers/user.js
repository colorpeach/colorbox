var desktopApps = require('../models/desktop-app');
var baseRes = require('./baseResponse');

module.exports = {
    '/get/desktop/apps':{
        get:function(){
            return function(req,res,next){
                var data = {user: req.session.user.login};

                desktopApps.query(data, function(data){
                    res.end(baseRes(data[0]));
                }, {apps: 1});
            }
        }
    },
    '/save/desktop/apps':{
        post:function(){
            return function(req,res,next){
                var data = {user: req.session.user.login};

                data.apps = req.body.apps || [];

                desktopApps.update(data, function(){
                    res.end(baseRes());
                }, ['user']);
            }
        }
    }
}