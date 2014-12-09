define(['angular', 'js/app'], function(_, app){
    app
    .directive('drag',
    ['$window', '$timeout',
        function($window, $timeout){
            var eventsMap = {
                web: {
                    down: 'mousedown',
                    up: 'mouseup',
                    move: 'mousemove'
                },
                mobile: {
                    down: 'touchstart',
                    up: 'touchend',
                    move: 'touchmove'
                }
            };
            var device;
            var $body = angular.element($window.document.body);

            if($window.document.hasOwnProperty("ontouchstart")){
                device = 'mobile';
            }else{
                device = 'web';
            }
            return {
                restrict: 'A',
                link: function(scope, element, attrs){
                    var timer;

                    element.bind(eventsMap[device].down, elementDown);
                    element.bind(eventsMap[device].up, elementUp);

                    function elementDown(e){
                        e.preventDefault();

                        if(timer){
                            $timeout.cancel(timer);
                        }

                        timer = $timeout(function(){
                            startDrag(e);
                        }, 300);
                    }

                    function elementUp(e){
                        if(timer){
                            $timeout.cancel(timer);
                        }
                    }

                    function startDrag(e){
                        var rect = element[0].getBoundingClientRect();
                        var position = {};
                        var moveTimer;
                        var relative = {};
                        var point = {};

                        if(e.touches){
                            relative.x = e.touches[0].clientX - rect.left;
                            relative.y = e.touches[0].clientY - rect.top;
                        }else{
                            relative.x = e.clientX - rect.left;
                            relative.y = e.clientY - rect.top;
                        }

                        $body.bind(eventsMap[device].move, function(e){
                            if(e.touches){
                                e.preventDefault();
                                point = {
                                    x: e.touches[0].clientX,
                                    y: e.touches[0].clientY
                                };
                            }else{
                                point = {
                                    x: e.clientX,
                                    y: e.clientY
                                };
                            }

                            position = {
                                left: point.x - relative.x + 'px',
                                top: point.y - relative.y + 'px'
                            };
                            
                            element.css(position);
                        });

                        $body.bind(eventsMap[device].up, function(e){
                            $body.off(eventsMap[device].move);
                            $body.off(eventsMap[device].up);
                        });
                    }
                }
            };
        }
    ]);
});