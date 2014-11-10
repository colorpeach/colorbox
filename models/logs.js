var dbClient = require('../database');
var tidy = dbClient.column({
    date         : 'date',
    content  : 'content'
});
var logs = {};

//新增log
logs.add = function(data,fn){
    var d = tidy(data);
    dbClient.connect([
        function(db,callback){
            db.collection('logs').insert(d,function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

//更新log
logs.update = function(data,fn){
    var d = dbClient.split(tidy(data));
    dbClient.connect([
        function(db,callback){
            db.collection('logs').update(d.search,{$set:d.data},function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

//查询
logs.query = function(data,fn,filter){
    var d = tidy(data);
    dbClient.connect([
        function(db,callback){
            db.collection('logs').find(d,{fields:filter}).sort({'date': -1}).toArray(function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

//删除log
logs.del = function(data,fn){
    var d = tidy(data);
    dbClient.connect([
        function(db,callback){
            db.collection('logs').remove(d,function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

module.exports = logs;