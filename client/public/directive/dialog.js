define(['angular', 'js/app'], function(_, app){
    app
    .factory('dialog',
    ['$window', '$templateCache', '$compile',
        function($window,   $templateCache,   $compile){
            var $document = angular.element($window.document);
            var template;
            var css = {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'none'
            };
            

            function Dialog(opts){
                this.element = angular.element('<div></div>');
                this.overlay = angular.element('<div></div>');
                this.opts = opts;
                
                if(opts.target){
                    template = $window.document.getElementById(opts.target);
                }else if(opts.template && (template = $templateCache.get(opts.template))){
                    opts.template = template;
                }

                this.element.append(opts.template);

                if(opts.template && opts.scope){
                    $compile(this.element)(opts.scope);
                }
                if(opts.width) this.element.css({width: opts.width});
                if(opts.height) this.element.css({height: opts.height});
                this.element.css(css).css({zIndex: 1500}).css({margin: 'auto'});
                this.overlay.css(css).css({zIndex: 1499});

                if(!opts.target){
                    angular.element($window.document.body).append(this.element).append(this.overlay);
                }
            }

            Dialog.prototype = {
                open: function(){
                    this.element.css({display: 'block'});
                    this.overlay.css({display: 'block'});
                    bindEvents.call(this);
                },
                close: function(){
                    this.element.css({display: 'none'});
                    this.overlay.css({display: 'none'});
                    removeEvents.call(this);
                }
            };

            function position(){

            }

            function bindEvents(){
                var self = this;

                this.overlay.bind('mousedown', function(){
                     self.close();
                });
            }

            function removeEvents(){
                this.overlay.off('mousedown');
            }

            return function(opts){
                return new Dialog(opts);
            };
        }
    ])
});