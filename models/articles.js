var base = require('./base-module');

var articles = {};
for(var i in base){
    articles[i] = base[i];
}
articles.collection = "article";
articles.column = {
    user: 'user',
    content: 'content',
    name: 'name',
    public: 'public'
};

module.exports = articles;