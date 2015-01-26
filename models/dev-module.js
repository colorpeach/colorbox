var dbClient = require('../database');

var dev = {};

dev.add = function(data,fn){
    var model = this;
    var d = dev.tidy(model.column,data);
    dbClient.connectDev([
        function(db,callback){
            db.collection(model.collection).insert(d,function(err,data){
                callback(err,data);
            });
        }
    ],fn);
};

dev.update = function(data,fn, searchKeys){
    var model = this;
    var d = dev.dbClient.split(dev.tidy(model.column,data),searchKeys);
    dbClient.connectDev([
        function(db,callback){
            db.collection(model.collection).update(d.search,{$set:d.data},function(err,data){
                callback(err,data);
            });
        }
    ],fn);
};

dev.save = function(data,fn, searchKeys){
    var model = this;
    var d = dev.dbClient.split(dev.tidy(model.column,data),searchKeys);
    dbClient.connectDev([
        function(db,callback){
            db.collection(model.collection).save(d,function(err,data){
                callback(err,data);
            });
        }
    ],fn);
};

dev.query = function(data,fn,filter,opera){
    var model = this;
    var d = dev.tidy(model.column,data);
    dbClient.connectDev([
        function(db,callback){
            db.collection(model.collection).find(d,{fields:filter})
                .sort(opera ? opera.sort : null)
                .limit(opera ? opera.limit : null)
                .skip(opera ? opera.skip : null).toArray(function(err,data){
                    callback(err,data);
                });
        }
    ],fn);
};

dev.del = function(data,fn){
    var model = this;
    var d = dev.tidy(model.column,data);
    dbClient.connectDev([
        function(db,callback){
            db.collection(model.collection).remove(d,function(err,data){
                callback(err,data);
            });
        }
    ],fn);
};

dev.tidy = function(column,data){
    return dbClient.column(column)(data);
};

dev.dbClient = dbClient;
module.exports = dev;