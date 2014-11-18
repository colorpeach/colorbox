var path = require('path');
var express = require("express");
var app = express();

app.set("views",__dirname+"/client");
app.set("view engine","jade");

//压缩
app.use(require('compression')({
    threshold:512
}));
//报文实体解析
app.use(require('body-parser')());
//favicon图标
// app.use(require('serve-favicon')(__dirname + 'client/favicon.ico'));
//重写http方法，在客户端不支持put或者delete等方法时也能继续使用
app.use(require("method-override")());
//cookie解析
app.use(require("cookie-parser")());
app.use(require("express-session")({
    secret: 'colorbox',
    name: 'sid',
    cookie: { maxAge:86400000 }
}));

//静态文件路径
app.use(require("serve-static")(path.join(__dirname,"client")));

app.listen(process.env.PORT || process.env.VMC_APP_PORT || 3000, function(){
    console.log('running colorbox');
});

require("./route/route.js")(app);