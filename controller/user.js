var desktopApps = require('../models/desktop-app');
var userRule = require('../web/validate/user');
var baseRes = require('./baseResponse');
var registerValid = require('./rules');
var userCtrl = {};

//更新桌面应用
userCtrl.updateDesktopApps = function(req,res){
    var data = {user: req.session.user.login};

    data.apps = req.body.apps || [];

    desktopApps.update(data, function(){
        res.end(baseRes());
    }, ['user']);
};

userCtrl.getDesktopApps = function(req, res){
    var data = {user: req.session.user.login};

    desktopApps.query(data, function(data){
        res.end(baseRes(data[0]));
    }, {apps: 1});
};

module.exports = userCtrl;