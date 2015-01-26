var base = require('./base-module');
var instant = {};

for (var i in base) {
    instant[i] = base[i];
}

instant.collection = "instant";

instant.column = {
    snippetId: 'snippetId',
    sessionId: 'sessionId',
    finalActive: 'finalActive',
    html: 'html',
    css: 'css',
    javascript: 'javascript'
};

//自动删除30min之前的instant
instant.delInvalid = function (fn) {
    var model = this;
    base.dbClient.connect([
        function (db, callback) {
            db.collection(model.collection).remove({finalActive: {$lt: new Date().getTime() - 30 * 60 * 1000}}, function (err, data) {
                callback(err, data);
            });
        }
    ], fn);
}

module.exports = instant;