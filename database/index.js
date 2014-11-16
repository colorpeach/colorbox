var async = require('async');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var ObjectID = require('mongodb').ObjectID;
var url = process.env.MONGODB || 'mongodb://wxen:ll0427##@ds049180.mongolab.com:49180/colorbox' || 'mongodb://127.0.0.1:27017/colorbox';

//async waterfall 
module.exports = {
    connect:function(tasks,fn){
        var nowDb,
            task = function(callback){
                MongoClient.connect(url,function(err,db){
                    callback(err,nowDb = db);
                });
            };
            
        tasks.unshift(task);
        
        async.waterfall(tasks,function(err,results){
            if(err && err !== true) throw err;
            nowDb.close();
            fn(results);
        });
    },
    //返回过滤数据的function
    column:function(column){
        column.length ? column.unshift('_id') : (column._id = '_id');
        return column.length ? 
            function(data){
                var d = {};
                for(var i=0,n,len=column.length;i<len;i++){
                    n = column[i];
                    if(data[n] != undefined){
                        if(n !== '_id'){
                            d[n] = data[n];
                        }else{
                            d[n] = new ObjectID(data[n]);
                        }
                    }
                }
                return d;
            }
            :
            function(data){
                var d = {};
                for(var m in column){
                    var n = column[m];
                    if(data[n] != undefined){
                        if(m !== '_id'){
                            d[m] = data[n];
                        }else{
                            d[m] = new ObjectID(data[n]);
                        }
                    }
                }
                return d;
            };
    },
    //将数据分割为查询部分和更新部分
    split:function(data,searchKey){
        var key,d = {};
        d.search = {};
        d.data = data;
        
        if(!searchKey || !searchKey.length){
            searchKey = ['_id'];
        }
        
        while(key = searchKey.shift()){
            if(data[key] != undefined){
                d.search[key] = data[key];
                delete data[key];
            }
        }
        return d;
    }
};