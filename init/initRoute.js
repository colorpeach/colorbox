var glob = require('glob');
var BaseController = require('../init/BaseController.js');
var methods = require('../config/methods');

exports.route = function(app){
    var paths = {
        controllers: '/controllers/',
        filters: '/filters/'
    };
    var prefix = __dirname.replace(/\\/g,'\/').replace('/init','');
    var ctrlDir = prefix + paths.controllers;
    glob.sync(ctrlDir + '/**/*.+(js)').forEach(function(file) {
        file = file.replace(/\/index\.(js)$/, '');
        var router = require(file);
//        var path = file.replace(ctrlDir.replace(/\/$/, ''), '').replace(/\.(js)$/, '');
        for (var i in router) {
            var p = i;
            if (p != '/') {
                p = p.replace(/\/$/, '')
            }
            var r = router[i];
            methods.forEach(function(method) {
                var eachRouter = r[method];
                if (eachRouter) {

                    var controller = new BaseController(app, eachRouter, p.replace(/^\//, ''), method);

                    if (controller.newName) {
                        p = p.replace(controller.name, controller.newName);
                        console.log("route:" + method + ':' + p);
                        app[method].apply(app, [p].concat(controller.getRoutes()));
                    } else {
                        console.log("route:" + method + ':' + p);
                        app[method].apply(app, [p].concat(controller.getRoutes()));
                    }

                }
            });
        }

    });

};