var Rules = {};
var Valid = {};

Rules.required = function (val) {
    return val !== undefined && val !== '';
};

//验证密码仅为数字
Rules.passwordNumOnly = /\d+/;

Rules.number = function (val) {
    var number = /^[0-9]+([.]{0,1}[0-9]+){0,1}$/;
    return number.test(val);
}

Rules.lengthAndType = /^[A-Za-z0-9]{6,12}$/;

Rules.minLength = function (val, param) {
    return val.length >= param;
}

Rules.maxLength = function (val, param) {
    return val.length <= param;
}

Valid.addRules = function (name, rule) {
    if (typeof rule != "function")
        return false;
    Rules[name] = rule;
};

Valid.validate = function (data, rules) {

    var r = {
        valid: true
    };
    var errorMsg  = [];

    for(var key in rules){
        for(var key2 in rules[key]){
            var param;
            if (key2.indexOf("|") != -1) {
                var arr = key2.split("|");
                key2 = arr[0];
                param = arr[1];
            }
            if(key2 == "required"){
                if(!(key in data)){
                    errorMsg.push(key +"为必填项");
                    break;
                }
            }
            if(key2 in Rules){
                var result;
                if (typeof Rules[key2] == "function")
                    result = Rules[key2](data[key], param);
                else
                    result = Rules[key2].test(data[key]);
                if (!result) {
                    if (rules[key][key2])
                        errorMsg.push(key + ":" + rules[key][key2]);
                    else
                        errorMsg.push(key + ":验证失败");
                    break;
                }
            }
        }
    }

    if (errorMsg.length) {
        r.valid = false;
        r.errorMsg = errorMsg;
    }
    return r;

};

module.exports = Valid;