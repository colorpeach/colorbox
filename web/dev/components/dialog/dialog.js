define(['angular', 'js/app'], function(_, app){
    app
    .factory('dialog',
    ['$window', '$templateCache', '$compile',
        function($window,   $templateCache,   $compile){
            var $document = angular.element($window.document);
            var cssList = ['maxWidth', 'minWidth', 'width', 'maxHeight', 'minHeight', 'height'];
            var template;
            var css = {
                position: 'absolute',
                display: 'none',
                zIndex: 1500,
                visibility: 'visible'
            };
            

            function Dialog(opts){
                this.element = angular.element('<div class="dialog"></div>');
                this.overlay = angular.element('<div class="dialog--bg"></div>');
                this.$close = angular.element('<a class="dialog--close">×</a>');
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

                addCss(opts, this.element);
                this.element.css(css);

                if(!opts.target){
                    angular.element($window.document.body)
                        .append(this.overlay.append(this.element.append(this.$close)));
                }

                bindEvents.call(this);
            }

            Dialog.prototype = {
                open: function(){
                    this.element.css({display: 'block'});
                    this.overlay.css({display: 'block'});
                },
                close: function(){
                    this.element.css({display: 'none'});
                    this.overlay.css({display: 'none'});
                    this.opts.onClose && this.opts.onClose();
                }
            };

            function addCss(opts, element){
                var css = {};
                var prop = 0;

                angular.forEach(cssList, function(n){
                    if(opts[n]){
                        css[n] = opts[n];
                        prop++;
                    }
                });

                element.css(css);
            }

            function position(){

            }

            function bindEvents(){
                var self = this;

                this.element.bind('mousedown', function(e){
                    e.stopPropagation();
                });

                this.overlay.bind('mousedown', function(){
                     self.close();
                });

                this.$close.bind('click', function(){
                    self.close();
                });
            }

            return function(opts){
                return new Dialog(opts);
            };
        }
    ])
});