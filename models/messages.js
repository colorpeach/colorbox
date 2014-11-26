var base = require('./base');

var message = {};
for(var i in base){
    message[i] = base[i];
}
message.collection = "message";
message.column = {
    user: 'user',
    content: 'content',
    date: 'date',
    responses: 'responses'
};

module.exports = message;