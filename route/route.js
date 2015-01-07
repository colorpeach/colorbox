var initRoute = require('../init/initRoute.js');
var settings = require('../config/settings');
var authPath = settings.authPath;
var authAjaxPath = settings.authAjaxPath;
var unauthAjaxPath = settings.unauthAjaxPath;
var unauthPath = settings.unauthPath;
var staticPath = settings.staticPath;
var validPath = authPath.concat(unauthPath, authAjaxPath, unauthAjaxPath, staticPath, 'favicon.ico');

module.exports = function (app) {
    //权限
    app.all('*', function (req, res, next) {
        var path = req._parsedUrl.pathname.split('/')[1];

        if (validPath.indexOf(path) >= 0 || req.url.indexOf('.html') > 0) {

            if (!req.session.user) {
                if (authAjaxPath.indexOf(path) >= 0) {
                    //访问未授权信息
                    res.statusCode = 401;
                    res.end();
                    return;
                } else if (authPath.indexOf(path) >= 0) {
                    //访问未授权页面
                    res.redirect('/login?backurl=' + req.url);
                    return;
                }
            }
            next();
        } else {
            res.render('views/not-found', {user: req.session.user});
        }
    });
    initRoute.route(app);
};