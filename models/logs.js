var base = require('./base-module');
var logs = {};

for(var i in base){
    logs[i] = base[i];
}
logs.collection = "logs";
logs.column = {
    date     : 'date',
    content  : 'content'
};

module.exports = logs;