define(['angular', 'js/app'], function(_, app){
    /**
    *@name dialog
    *@param opts {Object}
    *@param opts.scope {Object} 作用域
    *@param opts.template {string} 模板或模板id
    *@param opts.target {Object} 元素id直接作为模板
    *@param opts.width {string} dialog宽度
    *@param opts.minWidth {string} dialog最小宽度
    *@param opts.maxWidth {string} dialog最大宽度
    *@param opts.height {string} dialog高度
    *@param opts.minHeight {string} dialog最小高度
    *@param opts.maxHeight {string} dialog最大高度
    */

    app
    .factory('dialog',
    ['$window', '$templateCache', '$compile', '$rootScope',
        function($window,   $templateCache,   $compile,   $rootScope){
            var $document = angular.element($window.document);
            var cssList = ['maxWidth', 'minWidth', 'width', 'maxHeight', 'minHeight', 'height'];
            var template;
            var css = {
                visibility: 'visible'
            };

            function Dialog(opts){
                this.element = angular.element('<div class="dialog"></div>');
                this.overlay = angular.element('<div class="dialog__bg"></div>');
                this.$close = angular.element('<a class="dialog__close">×</a>');
                this.opts = opts;
                
                if(opts.target){
                    template = $window.document.getElementById(opts.target);
                }else if(opts.template && (template = $templateCache.get(opts.template))){
                    opts.template = template;
                }

                this.element.append(opts.template);

                if(opts.template && opts.scope){
                    $compile(this.element.contents())(opts.scope);
                }

                addCss(opts, this.element);
                this.element.css(css);

                if(!opts.target){
                    angular.element($window.document.body)
                        .append(this.overlay.append(this.element.append(this.$close)));
                }

                bindEvents.call(this);

                if(opts.scope){
                    var self = this;
                    opts.scope.$on('$destroy', function(){
                        self.destroy();
                        opts.scope = null;
                    });
                }
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
                },
                destroy: function(){
                    this.element.remove();
                    this.overlay.remove();
                    this.element = this.overlay = null;
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