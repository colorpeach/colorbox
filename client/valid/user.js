var user = {};

user.username = {
    "required":"用户名为必填项"
}

user.password = {
    "required":"密码为必填项",
    "lengthAndType":"密码必须为6~12位的英文和数字"
}

module.exports = user;