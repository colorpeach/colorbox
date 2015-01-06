define(['js/app'], function(app){
    app

    .value('config', {
        desktop: {
            appCell: {
                x: 100,
                y: 100,
                offset: 4
            },
            maxWidth: 1000,
            offset: 10
        },
        editorThemes: ["ambiance", "chaos", "chrome", "clouds", "clouds_midnight", "cobalt", "crimson_editor", "dawn", "dreamweaver", "eclipse", "github", "idle_fingers", "katzenmilch", "kr_theme", "kuroir", "merbivore", "merbivore_soft", "mono_industrial", "monokai", "pastel_on_dark", "solarized_dark", "solarized_light", "terminal", "textmate", "tomorrow", "tomorrow_night", "tomorrow_night_blue", "tomorrow_night_bright", "tomorrow_night_eighties", "twilight", "vibrant_ink", "xcode"]
    })
    
    //接口
    .factory('data::crud',
    ['$http',
        function($http){
            return {
                desktop: {
                    getDesktopApps: function(){
                        return $http.get('/get/desktop/apps');
                    },
                    updateDesktopApps: function(data){
                        return $http.post('/save/desktop/apps', data);
                    }
                },
                app: {
                    get: function(id){
                        return $http.get('/get/app-pro', {params: {_id: id}});
                    },
                    add: function(data){
                        return $http.post('/add/app-pro', data);
                    },
                    save: function(data){
                        return $http.post('/save/app-pro', data);
                    },
                    del: function(id){
                        return $http.post('/del/app-pro', {_id: id});
                    },
                    getUserApps: function(){
                        return $http.get('/get/user/app-pro', {cache: true});
                    },
                    getPublishedApps: function(data){
                        return $http.get('/_get/published/app-pros', {params: data});
                    },
                    getFile: function(id){
                        return $http.get('/get/app-pro/item', {params: {id: id}});
                    },
                    getFiles: function(id){
                        return $http.get('/get/app-pro/items', {params: {_id: id}});
                    },
                    addFile: function(data){
                        return $http.post('/add/app-pro/item', data);
                    },
                    saveFile: function(data){
                        return $http.post('/save/app-pro/item', data);
                    },
                    delFile: function(data){
                        return $http.post('/del/app-pro/item', data);
                    }
                },
                snippet: {
                    get: function(id){
                        return $http.get('/get/snippet?_id='+ id);
                    },
                    add: function(data){
                        return $http.post('/add/snippet', data);
                    },
                    del: function(id){
                        return $http.post('/del/snippet', {_id: id});
                    },
                    save: function(data){
                        return $http.post('/save/snippet', data);
                    },
                    getSnippets: function(){
                        return $http.get('/_get/user/snippets', {cache: true});
                    },
                    getAllSnippets: function(){
                        return $http.get('/_get/snippets');
                    }
                },
                article: {
                    get: function(id){
                        return $http.get('/_get/article?_id='+ id);
                    },
                    add: function(data){
                        return $http.post('/add/article', data);
                    },
                    del: function(id){
                        return $http.post('/del/article', {_id: id});
                    },
                    save: function(data){
                        return $http.post('/save/article', data);
                    },
                    getArticles: function(){
                        return $http.get('/get/article-list/user');
                    }
                },
                message: {
                    getMessages: function(){
                        return $http.get('/_get/messages');
                    },
                    save: function(data){
                        return $http.post('/save/message', data);
                    },
                    add: function(data){
                        return $http.post('/add/message', data);
                    }
                },
                login: {
                    enter: function(data){
                        return $http.post('/_login', data);
                    },
                    register: function(data){
                        return $http.post('/_register', data);
                    }
                },
                log: {
                    get: function(){
                        return $http.get('/_get/logs', {cache: true});
                    }
                }
            };
        }
    ]);
});