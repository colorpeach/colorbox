var dbClient = require('../database');
var tidy = dbClient.column({
    login:'username',
    email:'email',
    password:'password',
    config: 'config'
});
var user = {};

//新增用户
user.add = function(data,fn){
    var d = tidy(data);
    dbClient.connect([
        function(db,callback){
            db.collection('user').insert(d,function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

//更新用户
user.update = function(data,fn){
    var d = dbClient.split(tidy(data));
    dbClient.connect([
        function(db,callback){
            db.collection('user').update(d.search,{$set:d.data},function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

//查询
user.query = function(data,fn,filter){
    var d = tidy(data);
    dbClient.connect([
        function(db,callback){
            db.collection('user').find(d,{fields:filter}).toArray(function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

module.exports = user;