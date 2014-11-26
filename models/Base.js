var dbClient = require('../database');

var base = {};

base.add = function(data,fn,model){
    dbClient.connect([
        function(db,callback){
            db.collection(model.collection).insert(d,function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

base.update = function(data,fn,model){
    var d = base.tidy(model.column,data);
    dbClient.connect([
        function(db,callback,model){
            db.collection(model.collection).update(d.search,{$set:d.data},function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

base.query = function(model,data,fn,filter){
    var d = base.tidy(model.column,data);
    dbClient.connect([
        function(db,callback){
            db.collection(model.collection).find(d,{fields:filter}).toArray(function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

base.del = function(data,fn,model){
    var d = base.tidy(model.column,data);
    dbClient.connect([
        function(db,callback){
            db.collection(model.collection).remove(d,function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

base.tidy = function(column,data){
    return dbClient.column(column)(data);
}

base.dbClient = dbClient;
module.exports = base;