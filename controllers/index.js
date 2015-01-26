var fs = require('fs');
var path = require('path');
var user = require('../models/user');
var baseRes = require('./baseResponse');
var desktopApps = require('../models/desktop-app');
var registerValid = require('../utils/rules');
var userRule = require('../web/validate/user');

module.exports = {
    '/': {
        get: function () {
            return function (req, res) {
                res.render('views/index', {
                    title: 'colorbox',
                    user: req.session.user
                });
            }
        }
    },
    //html模板
    '/:template.html': {
        get: function () {
            return function (req, res) {
                var url = 'pages/' + req.params.template.split('-')[0] + '/' + req.params.template;
                var fileUrl = path.join(process.env.staticPath, url);

                fs.exists(fileUrl + '.jade', function (exists) {
                    if (exists) {
                        res.render(url, {user: req.session.user});
                    } else {
                        res.render('views/not-found');
                    }
                });
            }
        }
    },
    //app页面
    '/apps/:appName': {
        get: function () {
            return function (req, res) {
                apps.query(req.query, function (data) {
                    res.end(baseRes({app: data[0]}));
                })
            }
        }
    },
    '/_login': {
        post: function () {
            return function (req, res) {
                user.query(req.body, function (list) {
                    if (list.length) {
                        req.session.user = list[0];
                        res.end(baseRes({user: {login: list[0].login}}));
                    } else {
                        res.end(baseRes({errorMsg: ['用户名或密码不正确']}));
                    }
                });
            }
        }
    },
    '/_logout': {
        get: function () {
            return function (req, res) {
                req.session.destroy(function () {
                    res.redirect(req.headers.referer || '/');
                });
            }
        }
    },
    '/_register': {
        post: function () {
            return function (req, res) {
                var r = registerValid.validate(req.body, userRule);
                if (r.valid) {
                    user.query({username: req.body.username}, function (list) {
                        if (list.length) {
                            res.end(baseRes({errorMsg: ['用户已存在']}));
                        } else {
                            user.add(req.body, function (data) {
                                desktopApps.add({user: data[0].login}, function () {
                                    req.session.user = data[0];
                                    res.end(baseRes({user: {login: data[0].login}}));
                                });
                            });
                        }
                    });
                } else {
                    res.end(baseRes(r));
                }
            }
        }
    }
};