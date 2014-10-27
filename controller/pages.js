var pages = {};

pages.index = function(req, res){
    res.render('public/index');
};

pages.apps = function(req, res){
    res.render('apps/' + req.params.appName +'/index');
};

module.exports = pages;