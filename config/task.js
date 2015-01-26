var later = require('later');
var instant = require('../models/instant');

var sche = later.parse.recur().every(30).minute(),
    t = later.setInterval(function () {
        instant.delInvalid(function () {
            console.log("Clean invalid instant-snippets already." + new Date());
        })
    }, sche);


