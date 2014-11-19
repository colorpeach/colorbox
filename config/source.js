var baseUrl = '/source/';

var urls = {
    javascript: {
        'jquery': '',
        'angular': ''
    },
    css: {
        'reset': '',
        'normalize': '',
        'foundation': '',
        'bootstrap': ''
    }
};

var suffix = {
    javascript: '.js',
    css: '.css'
};

module.exports = function(type, name, min){
    return baseUrl + type + '/' + name + '/' + name + (min ? '.min') + suffix[type];
};