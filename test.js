var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport(
// {
//     service: 'QQ',
//     auth: {
//         user: '514571352@qq.com',
//         pass: 'll0427'
//     }
// }
);
transporter.sendMail({
    from: 'admin@colorbox.com',
    to: 'colorpeach@live.com',
    subject: 'hello',
    text: 'hello world!'
}, function(err){
    if(err){
        console.log(err);
    }else{
        console.log('Sended');
    }
});
