var dbClient = require('../database');
var tidy = dbClient.column({
    user: 'user',
    content: 'content',
    date: 'date',
    responses: 'responses'
});
var message = {};

//新增留言
message.add = function(data,fn){
    var d = tidy(data);
    dbClient.connect([
        function(db,callback){
            db.collection('message').insert(d,function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

//更新留言
message.update = function(data,fn){
    var d = dbClient.split(tidy(data));
    dbClient.connect([
        function(db,callback){
            db.collection('message').update(d.search,{$set:d.data},function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

//查询
message.query = function(data,fn,filter){
    var d = tidy(data);
    dbClient.connect([
        function(db,callback){
            db.collection('message').find(d,{fields:filter}).sort({'date': -1}).toArray(function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

module.exports = message;