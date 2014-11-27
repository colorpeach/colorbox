var base = require('./base-module');
var user = {};

for(var i in base){
    user[i] = base[i];
}
user.collection = "user";
user.column = {
    login:'username',
    email:'email',
    password:'password',
    config: 'config',
    desktopApps: 'desktopApps'
}

module.exports = user;