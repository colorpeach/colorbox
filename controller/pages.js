var fs = require('fs');
var path = require('path');
var pages = {};

pages.index = function(req, res){
    res.render('public/index', {
        title: 'colorbox',
        user: req.session.user
    });
};

pages.apps = function(req, res){
    res.render('apps/' + req.params.appName +'/index');
};

pages.html = function(req, res){
    var url = 'template/' + req.params.template;
    var fileUrl = __dirname.replace(/\\/g, '/').replace('controller', '') + 'client/' + url + '.jade';
    
    fs.exists(fileUrl, function(exists){
        if(exists){
            res.render(url, {user: req.session.user});
        }else{
            res.render('template/not-found');
        }
    });
    
};

module.exports = pages;