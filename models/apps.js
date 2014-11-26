var base = require('./base');
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

//查询
apps.operaQuery = function(data, fn, filter, opera){
    var d = base.tidy(apps.column,data);
    base.dbClient.connect([
        function(db,callback){
            if(opera){
                var o = db.collection(apps.collection).find(d,{fields:filter});
                for(var n in opera){
                    o = o[n](opera[n]);
                }
                o.toArray(function(err,data){
                    callback(err,data);
                });
            }else{
                db.collection(apps.collection).find(d,{fields:filter}).toArray(function(err,data){
                    callback(err,data);
                });
            }
        }
    ],fn);
}

module.exports = apps;