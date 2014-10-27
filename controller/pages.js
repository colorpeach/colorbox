var pages = {};

pages.index = function(req, res){
    res.render('public/index', {
        title: 'colorbox首页',
        user: req.session.user
    });
};

pages.apps = function(req, res){
    res.render('apps/' + req.params.appName +'/index');
};

module.exports = pages;