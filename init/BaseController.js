var Path = require('path')
var Controller = function(app, func, path, method) {
    this.func = func;
    this.method = method;
    this.path = path;
    this.name = path.replace(/.*\//, "");
    this.newName = null;
    var self = this;
    this.filters = [];
    this.beforeFilter = [];
    this.afterFilter = [];
    this.mainRoute = func.call(this);
}

Controller.prototype = {
    getRoutes: function() {
        return this.filters.concat([this.mainRoute]);
    },
    rename: function(name) {
        this.newName = name;
    },
    beforeFilter: function(beforeFilters){
        this.beforeFilter.concat(beforeFilters);
    },
    afterFilter:function(afterFilters){
        this.afterFilter.concat(afterFilters);
    }

}

module.exports = Controller