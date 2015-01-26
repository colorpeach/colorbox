var table = {};

table.map = {};

table.save = function(appName, tables){
    table.map[appName] = tables;
};

table.del = function(appName){
    delete table.map[appName];
};

table.checkTableName = function(tableName){
    for(var app in table.map){
        if(tableName in table.map[app]){
            return false;
        }
    }
    return true;
};

module.exports = table;