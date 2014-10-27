module.exports = function(opts){
    var opt = {
        error:0,
        errorMsg:[]
    };
    
    !opts && (opts = {});

    for(var n in opts){
        opt[n] = opts[n];
    }

    if(opts.errorMsg){
        opt.error = opts.errorMsg.length;
    }

    return JSON.stringify(opt);
};