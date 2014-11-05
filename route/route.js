var pages = require('../controller/pages.js');
var apps = require('../controller/apps.js');
var login = require('../controller/login.js');
var user = require('../controller/user.js');

var settings = require('../settings');
var authPath = settings.authPath;
var authAjaxPath = settings.authAjaxPath;
var unauthAjaxPath = settings.unauthAjaxPath;
var unauthPath = settings.unauthPath;
var staticPath = settings.staticPath;
var validPath = authPath.concat(unauthPath,authAjaxPath,unauthAjaxPath,staticPath,'favicon.ico');

module.exports = function(app){
    //权限
    app.all('*',function(req,res,next){
        var path = req._parsedUrl.pathname.split('/')[1];

        if(validPath.indexOf(path) >= 0 || path.indexOf('.html') > 0){
            
            if(!req.session.user){
                if(authAjaxPath.indexOf(path) >= 0){
                    //访问未授权信息
                    res.statusCode = 401;
                    res.end();
                    return;
                }else if(authPath.indexOf(path) >= 0){
                    //访问未授权页面
                    res.redirect('/login?backurl='+req.url);
                    return;
                }
            }
            
            next();
        }else{
            res.render('template/not-found',{user:req.session.user});
        }
    });
    //首页
    app.get('/', pages.index);
    //app页面
    app.get('/apps/:appName', pages.apps);
    //html模板
    app.get('/:template.html', pages.html);

    app.post('/login', login.enter);
    app.post('/register', login.register);
    app.get('/logout', login.out);
    //获取用户桌面应用
    app.get('/get/desktop/apps', user.getDesktopApps);
    //更新桌面应用
    app.post('/post/save/desktop/apps', user.updateDesktopApps);
    
    //应用预览页面
    app.get('/_apps/preview/:id', apps.apps_preview);
    //添加应用
    app.post('/post/add/app', apps.add);
    //更新应用
    app.post('/post/save/app', apps.save);
    //删除应用
    app.post('/post/del/app', apps.del);
    //获取应用
    app.get('/get/app', apps.get);
    //获取用户的所有应用
    app.get('/get/apps', apps.get_apps);
    //获取发布的应用
    app.get('/_get/published/apps', apps.get_published_apps);
};