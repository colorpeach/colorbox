var base = require('./base-module');
var apps = {};

for(var i in base){
    apps[i] = base[i];
}

apps.collection = "apps";
apps.column = {
    name         : 'name',
    description  : 'description',
    jade         : 'jade',
    css          : 'css',
    js           : 'js',
    user         : 'user',
    sizes        : 'sizes',
    createDate   : 'createDate',
    stars        : 'stars',
    type         : 'type'
};

module.exports = apps;