angular.module('utils', [])

.factory('utils', function(){
    var docprefix = /^[^\/]+\/\*!\s*/;
    var docsuffix = /\s*\*\/[^\/]+$/;
    var format = /\{(\d+)\}/g;

    return {
        /*
        *
        */
        heredoc: function(f){
            return f.toString()
                    .replace(docprefix, '')
                    .replace(docsuffix, '');
        },
        format: function(tpl, args){
            return tpl.replace(format, function(m, d){
                return args[d] || '';
            });
        }
    }
})

.directive('viewLink',
[
    function(){
        return {
            restrict: 'A',
            compile: function(_element, _attrs){
                var href = _element.attr('href');
                _element.attr('href', '#' + href);
            }
        };
    }
]);