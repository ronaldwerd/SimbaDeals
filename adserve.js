/*
"description":"Rittenhouse The Reacher, 32\" (81.3 cm) longlightweight constructionwith less strain on your back you can work longer and help prevent injury  This ergonomic tool lets you grab myriad hard-to-reach items without bending, stretching, or straining. Pick up litter without leaving the seat of your lawn mower! Clean up unsanitary items without using your hands.",
    "merchantId":351,
    "discountRate":0.0,
    "deepLink":"http://www.jdoqocy.com/click-7051195-10722217?url=http%3A%2F%2Fwww.sears.ca%2Fproduct%2Frittenhouse-the-reacher%2F661-000661561-52632&sid=2_19663200",
    "imageURL":"http://www.sears.ca/wcsstore/MasterCatalog/images/catalog/Product_271/std_lang_all/18/_p/661_10918_P.jpg",
    "salePrice":22.99,
    "retailPrice":22.99,
    "thumbnailURL":"http://www.sears.ca/wcsstore/MasterCatalog/images/catalog/Product_271/std_lang_all/18/_p/661_10918_P.jpg",
    "categoryId":134217728,
    "name":"Rittenhouse The Reacher",
    "id":19663200,
    "currency":"CAD"
*/



(function() {

    var $;

    loadJavaScript = function(url, callback) {
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
                simba_ad_engine($);
            });

        });
    }

})();