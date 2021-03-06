(function() {

    var engine;
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

        /*
         * Load any plugin scripts here
         */

        var scripts = ['http://simbadeals/underscore.js', 'http://simbadeals/simba-ad-engine-gam.js'];
        var scriptsLoaded = 0;

        for(var i = 0; i < scripts.length; i++) {

            $.getScript(scripts[i], function() {

                scriptsLoaded++;

                if(scriptsLoaded == scripts.length) {

                    $(document).ready(function($) {

                        $("<link/>", {
                            rel: "stylesheet",
                            type: "text/css",
                            href: "http://simbadeals/gam/bigbox/style.css"
                        }).appendTo("head");

                        $("<link/>", {
                            rel: "stylesheet",
                            type: "text/css",
                            href: "http://simbadeals/gam/leader/style.css"
                        }).appendTo("head");

                        $("<link/>", {
                            rel: "stylesheet",
                            type: "text/css",
                            href: "http://simbadeals/gam/halfpage/style.css"
                        }).appendTo("head");


                        simbaAdEngine($, _);
                    });
                }
            });
        }
    }
})();
