var dbClient = require('../database');
var tidy = dbClient.column({
    name         :'name',
    description  :'description',
    jade         :'jade',
    css          :'css',
    js           :'js',
    user         :'user',
    sizes        :'sizes'
});
var apps = {};

//新增app
apps.add = function(data,fn){
    var d = tidy(data);
    dbClient.connect([
        function(db,callback){
            db.collection('apps').insert(d,function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

//更新app
apps.update = function(data,fn){
    var d = dbClient.split(tidy(data));
    dbClient.connect([
        function(db,callback){
            db.collection('apps').update(d.search,{$set:d.data},function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

//查询
apps.query = function(data,fn,filter){
    var d = tidy(data);
    dbClient.connect([
        function(db,callback){
            db.collection('apps').find(d,{fields:filter}).toArray(function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

//删除app
apps.del = function(data,fn){
    var d = tidy(data);
    dbClient.connect([
        function(db,callback){
            db.collection('apps').remove(d,function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

module.exports = apps;