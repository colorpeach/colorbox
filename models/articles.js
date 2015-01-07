var base = require('./base-module');

var articles = {};
for(var i in base){
    articles[i] = base[i];
}
articles.collection = "article";
articles.column = {
    user: 'user',
    content: 'content',
    name: 'name',
    public: 'public'
};

//更新接口文档
articles.save = function(data,fn){
    var list = base.tidy(appPros.subTidy,data);
    var d = base.dbClient.split(base.tidy(appPros.column,data));
    var setMap = {};
    d.search['files.id'] = data.id;

    delete list._id;

    if(data.updateKeys){
        for(var n in data.updateKeys){
            setMap['files.$.' + data.updateKeys[n]] = list[data.updateKeys[n]];
        }
    }else{
        setMap['files.$'] = list;
    }

    base.dbClient.connect([
        function(db,callback){
            db.collection(appPros.collection).update(d.search, {$set: setMap},function(err,data){
                callback(err,data);
            });
        }
    ],fn);
}

module.exports = articles;