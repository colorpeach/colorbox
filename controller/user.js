var user = require('../models/user');
var userRule = require('../client/valid/user');
var baseRes = require('./baseResponse');
var registerValid = require('./rules');
var userCtrl = {};

//更新桌面应用
userCtrl.updateDesktopApps = function(req,res){
    var data = {username: req.session.user.login};

    data.desktopApps = req.body.desktopApps || [];

    user.update(data, function(){
        res.end(baseRes());
    });
};

userCtrl.getDesktopApps = function(req, res){
    var data = {username: req.session.user.login};

    user.query(data, function(data){
        res.end(baseRes(data[0]));
    }, {desktopApps: 1});
};

module.exports = userCtrl;