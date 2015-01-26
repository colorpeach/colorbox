var base = require('./base-module');

var appPros = {};

for (var i in base) {
    appPros[i] = base[i];
}
appPros.collection = "appPros";
appPros.column = {
    name: 'name',
    description: 'description',
    user: 'user',
    sizes: 'sizes',
    createDate: 'createDate',
    stars: 'stars',
    type: 'type',
    files: 'files',
    route: 'route',
    entrance: 'entrance',
    table: 'table'
};
appPros.subTidy = {
    id: 'id',
    parentId: 'parentId',
    name: 'name',
    url: 'url',
    content: 'content'
};


//新增app
appPros.add = function (data, fn) {
    if (!data.files) data.files = [];
    var d = base.tidy(appPros.column, data);

    base.dbClient.connect([
        function (db, callback) {
            db.collection(appPros.collection).insert(d, function (err, data) {
                callback(err, data);
            });
        }
    ], fn);
};

//查询
appPros.operaQuery = function (data, fn, filter, opera) {
    var d = base.tidy(appPros.column, data);
    base.dbClient.connect([
        function (db, callback) {
            if (opera) {
                var o = db.collection(appPros.collection).find(d, {fields: filter});
                for (var n in opera) {
                    o = o[n](opera[n]);
                }
                o.toArray(function (err, data) {
                    callback(err, data);
                });
            } else {
                db.collection(appPros.collection).find(d, {fields: filter}).toArray(function (err, data) {
                    callback(err, data);
                });
            }
        }
    ], fn);
};

//查询接口文档
appPros.queryItem = function (data, fn, filter) {
    var d = base.tidy(appPros.column, data);
    base.dbClient.connect([
        function (db, callback) {
            db.collection(appPros.collection).aggregate(
                {'$match': d},
                {'$project': {'files': '$files'}},
                {'$unwind': '$files'},
                {'$match': data.search},
                function (err, data) {
                    callback(err, data);
                }
            );
        }
    ], fn);
};

//新增接口文档
appPros.addItem = function (data, fn) {
    var parentId = data.parentId;
    var d = base.dbClient.split(base.tidy(appPros.column, data));
    d.data.parentId = parentId;
    base.dbClient.connect([
        function (db, callback) {
            db.collection(appPros.collection).find(d.search).toArray(function (err, data) {
                var list = data[0].files;
                var id = 1;

                if (list && list.length) {
                    id = (list[list.length - 1].id || 0) + 1;
                }

                callback(err, id, db);
            });
        },
        function (id, db, callback) {
            d.data.id = id;
            db.collection(appPros.collection).update(d.search, {$push: {'files': d.data}}, function (err, data) {
                callback(err, {id: id});
            });
        }
    ], fn);
};

//更新接口文档
appPros.updateItem = function (data, fn) {
    var list = base.tidy(appPros.subTidy, data);
    var d = base.dbClient.split(base.tidy(appPros.column, data));
    var setMap = {};
    d.search['files.id'] = data.id;

    delete list._id;

    if (data.updateKeys) {
        for (var n in data.updateKeys) {
            setMap['files.$.' + data.updateKeys[n]] = list[data.updateKeys[n]];
        }
    } else {
        setMap['files.$'] = list;
    }

    base.dbClient.connect([
        function (db, callback) {
            db.collection(appPros.collection).update(d.search, {$set: setMap}, function (err, data) {
                callback(err, data);
            });
        }
    ], fn);
};

//删除接口文档
appPros.deleteItem = function (data, fn) {
    data.files = {
        $or: [
            {id: data.id},
            {parentId: data.id}
        ]
    };
    var d = base.dbClient.split(base.tidy(appPros.column, data));

    base.dbClient.connect([
        function (db, callback) {
            db.collection(appPros.collection).update(d.search, {$pull: d.data}, function (err, data) {
                callback(err, data);
            });
        }
    ], fn);
};

module.exports = appPros;