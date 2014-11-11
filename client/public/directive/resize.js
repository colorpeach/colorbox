define(['angular'], function(){
    angular.module('components', [])

/*
*@param resizeBox {Array}
*
*[
    {
        templateUrl: '',
        show: true,
        real: {
            x: 0,
            y: 0
        }
    }
]
*
*/
    .directive('resizeBox',
    [
        function(){
            return {
                restrict: 'A',
                compile: function(){
                    return function(scope, element, attrs){

                    };
                }
            };
        }
    ])

    .directive('resizeBar',
    [
        function(){
            return {
                restrict: 'A',
                compile: function(){
                    return function(scope, element, attrs){
                        
                    };
                }
            };
        }
    ])
});