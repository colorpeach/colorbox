var base = require('./base-module');

var snippets = {};
for(var i in base){
    snippets[i] = base[i];
}
snippets.collection = "snippets";
snippets.column = {
    name         : 'name',
    description  : 'description',
    html         : 'html',
    css          : 'css',
    javascript   : 'javascript',
    user         : 'user',
    comments     : 'comments',
    stars        : 'stars'
};

module.exports = snippets;