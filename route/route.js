var pages = require('../controller/pages.js');

module.exports = function(app){
    //首页
    app.get('/', pages.index);
    //app页面
    app.get('/apps/:appName', pages.apps);
};