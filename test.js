var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var jade = require('jade');
var fs = require('fs');
var url = process.env.MONGODB || 'mongodb://127.0.0.1:27017/colorbox';

console.log('connecting');
MongoClient.connect(url,function(err, db){
    console.log('connected');
    db.collection('apps').find({}).toArray(function(err, data){
        console.log('get');
        data.forEach(function(n, i){
            n.files = [];
            n.entrance = '/app.html';

            var html = {
                content: '',
                id: 1,
                name: 'app.html',
                type: 'file',
                url: '/app.html'
            };
            var css = {
                content: '',
                id: 2,
                name: 'app.css',
                type: 'file',
                url: '/app.css'
            };
            var js = {
                content: '',
                id: 3,
                name: 'app.js',
                type: 'file',
                url: '/app.js'
            };
            var str = '';

            try{
                str = (n.jade ? jade.compile(n.jade, {pretty: '\t'})() : '');
            }catch(e){
                str = '';
                console.log(e);
            }

            var htmls = [
                '<!DOCTYPE html>',
                '<html>',
                '  <head>',
                '    <title>' + n.name + '</title>',
                '    <meta charset="utf-8">',
                '    <link rel="stylesheet" href="./app.css">',
                '  </head>',
                '  <body>' +
                (str || '').replace(/\t/g, '    ').replace(/\n/g, '\n    ') +
                (n.js && n.js.indexOf('angular') > -1 ? '  <script src="/lib/angular/1.3.0/angular.min.js"></script>' : ''),
                '    <script src="./app.js"></script>',
                '  </body>',
                '</html>'
            ];

            html.content = htmls.join('\n');

            css.content = n.css || '';

            js.content = n.js || '';

            n.files = [html, css, js];

            db.collection('appPros').save(n, function(){
                console.log('saved ' + n.name);
            });

            delete n.jade;
            delete n.js;
            delete n.css;
        });

        fs.writeFile('apps.json', new Buffer(JSON.stringify(data, null, 4)));
        console.log('finished');
        db.close();
    });
});
