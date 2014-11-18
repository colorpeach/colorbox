var dbClient = require('../database');
var tidy = dbClient.column({
    name         : 'name',
    description  : 'description',
    html         : 'html',
    css          : 'css',
    javascript   : 'javascript',
    user         : 'user',
    comments     : 'comments',
    stars        : 'stars'
});
var snippets = {};

//新增snippet
snippets.add = function(data,fn){
    var d = tidy(data);
    dbClient.connect([
        function(db,callback){
            db.collection('snippets').insert(d,function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

//更新snippet
snippets.update = function(data,fn){
    var d = dbClient.split(tidy(data));
    dbClient.connect([
        function(db,callback){
            db.collection('snippets').update(d.search,{$set:d.data},function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

//查询
snippets.query = function(data,fn,filter){
    var d = tidy(data);
    dbClient.connect([
        function(db,callback){
            db.collection('snippets').find(d,{fields:filter}).toArray(function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

//删除snippet
snippets.del = function(data,fn){
    var d = tidy(data);
    dbClient.connect([
        function(db,callback){
            db.collection('snippets').remove(d,function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

module.exports = snippets;