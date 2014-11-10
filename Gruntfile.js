module.exports = function(grunt){

    // 项目配置
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //uglify: {
        //    options: {
        //        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        //    },
        //    build:{
        //        files:[{
        //            expand: true,  
        //            cwd: 'client',
        //            src:'**/*.js',
        //            dest: 'dist'
        //        }]
        //    }
        //},
        //jshint:{
        //    all:'client/js/*.js'
        //},
        cssmin: {
          add_banner: {
            options: {
              banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            files: {
              'client/public/css/build.css': [
                'client/public/css/normalize.css',
                'client/public/css/foundation.css',
                'client/public/css/icon.css',
                'client/public/css/animate.css',
                'client/public/css/index.css'
              ]
            }
          }
        }
    });

    //grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['cssmin']);
    grunt.registerTask('buildcss', ['cssmin']);
}