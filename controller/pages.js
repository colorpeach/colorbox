var fs = require('fs');
var path = require('path');
var pages = {};

pages.index = function(req, res){
    res.render('views/index', {
        title: 'colorbox',
        user: req.session.user
    });
};

pages.apps = function(req, res){
    res.render('apps/' + req.params.appName +'/index');
};

pages.html = function(req, res){
    var url =  'pages/' + req.params.template.split('-')[0] + '/' + req.params.template;
    var fileUrl = path.join(process.env.staticPath, url);
    
    fs.exists(fileUrl + '.jade', function(exists){
        if(exists){
            res.render(url, {user: req.session.user});
        }else{
            res.render('views/not-found');
        }
    });
    
};

module.exports = pages;