var pages = require('../controller/pages.js');
var login = require('../controller/login.js');

module.exports = function(app){
    //首页
    app.get('/', pages.index);
    //app页面
    app.get('/apps/:appName', pages.apps);

    app.post('/login', login.enter);
    app.post('/register', login.register);
    app.get('/logout', login.out);
};