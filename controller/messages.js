var messages = require('../models/messages');
var baseRes = require('./baseResponse');
var _message = {};

_message.add = function(req, res){
    req.body.user = req.session.user.login;
    req.body.date = new Date();

    messages.add(req.body,function(data){
        res.end(baseRes({message: data[0]}));
    });
};

_message.save = function(req, res){
    var user = req.session.user.login;
    var data = req.body.responses[req.body.responses.length - 1];

    data.user = user;
    data.date = new Date();

    messages.update(req.body, function(data){
        res.end(baseRes({responses: req.body.responses}));
    });
};

_message.get_messages = function(req, res){
    messages.query({}, function(list){
        res.end(baseRes({messages: list}));
    },null,{"date":-1});
};

module.exports = _message;