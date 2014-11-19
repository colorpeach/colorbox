var source = require('./config/source.js');
var jade = require('jade');
var reg = /\{(.+)\}/g;
var docprefix = /^[^\/]+\/\*!\s*/;
var docsuffix = /\s*\*\/[^\/]+$/;
var heredoc = function(f){
    return f.toString()
            .replace(docprefix, '')
            .replace(docsuffix, '');
};
var template = heredoc(function(){/*!
    <!DOCTYPE html>
    <html>
        <head>
            <title>{title}</title>
            {heads}
            {cssLibs}
            {cssExternals}
            {css}
        <head>
        <body>
            {body}
            {jsLibs}
            {jsExternals}
            {javascript}
        </body>
    </html>
*/});

function generateBody(html){
    var r = html.content;

    switch(html.type){
        case 'jade':
             r = jade.render(r);
        break;
    }

    return r;
}

function generate(snippet){
    var page = {title: snippet.name};

    page.heads = snippet.html.heads.join('\n');
    page.cssLibs = snippet.css.libs.map(function(n, i){
        return '<link rel="stylesheet" href="' + source('css', n, true) + '">';
    }).join('\n');
    page.cssExternals = snippet.css.externals.map(function(n, i){
        return '<link rel="stylesheet" href="' + n + '">';
    }).join('\n');
    page.css = ['<style>', '/style'].join(snippet.css.content);
    page.body = generateBody(snippet.html);


    return template.replace(reg, function(s, n){
        return typeof d[n] === 'undefined' ? '' : d[n];
    });
}

module.exports = function(snippet){
    try{
        generate(snippet);
    }catch(){

    }
};