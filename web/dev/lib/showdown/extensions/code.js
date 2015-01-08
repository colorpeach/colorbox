//
//  code highlight
//  A showdown extension to add code highlight
//  hints to showdown's HTML output.
//

(function(){

    var code = function(converter) {
        return [
            { type: 'output', filter: function(source){

                return source.replace(/<code class="(.+)">([\S\s]*?)<\/code>/g, function(match, type, code) {
                    return match;
                });
            }}
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.code = code; }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = code;

}());