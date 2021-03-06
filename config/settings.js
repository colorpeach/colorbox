module.exports = {
    //需要权限访问
    authPath: [
        "apps",
        "user"
    ],
    //需要权限ajax访问
    authAjaxPath: [
        "get",
        "add",
        "del",
        "save"

    ],
    //不需要权限ajax访问
    unauthAjaxPath: [
        "_get",
        "_add",
        "_del",
        "_save",
        "_login",
        "_register"
    ],
    //不需要权限访问
    unauthPath: [
        "",
        "_logout",
        "_apps",
        "_app-pro",
        "_user",
        "_snippets",
        "_logs",
        "_logs",
        "_template",
        "application"
    ],
    //静态文件路径
    staticPath: [
        "public",
        "lib",
        "source"
    ]
};
