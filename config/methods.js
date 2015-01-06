var http = require('http');

if (http.METHODS) {

    module.exports = http.METHODS.map(function(method){
        return method.toLowerCase();
    });

} else {

    module.exports = [
        'get',
        'post',
    ];

}