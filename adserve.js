(function() {

    var $;

    var loadJavaScript = function(url, callback) {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type","text/javascript");
        script_tag.setAttribute("src", url);

        if (script_tag.readyState) {
            script_tag.onreadystatechange = function () { // For old versions of IE
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    callback();
                }
            };
        } else {
            script_tag.onload = callback;
        }

        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    }


    if (window.jQuery === undefined || window.jQuery.fn.jquery !== '1.11.0') {

        loadJavaScript("http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js", function() {
            $ = window.jQuery.noConflict(true);
            main();
        });

    } else {

        $ = window.jQuery;
        main();
    }


    function main() {
        $(document).ready(function($) {

            loadJavaScript("simba-ad-engine.js", function() {
                simbaAdEngine($);
            });

        });
    }

})();