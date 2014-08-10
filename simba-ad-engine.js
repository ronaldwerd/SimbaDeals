simbaAdEngine = function($, _) {

    var categoryCodes = [
        { code: 'SOME_AD_CODE', categoryId: '134217728', productCount: 8 }
    ];

    var findMerchant = function(merchantList, merchantId) {
        var m = $.grep(merchantList, function(m) {
            return m.id == merchantId;
        });

        var m = m[0];

        return m;
    }

    var queryForBanner = function(categoryCode, callback) {

        var c = $.grep(categoryCodes, function(e) {
            return e.code == categoryCode;
        });

        c = c[0];

        var getProducts = function(c) {
            var adUrl = "http://shop.monetizer101.com/shop-rest/api/v2.0/shop/2/widget/category?isoCurrencyCode=CAD&categoryId="
                        + c.categoryId + "&productLimit=" + c.productCount;

            $.ajax({
                url: adUrl,
                type: 'GET',
                dataType: 'json',
                retryLimit: 3,
                contentType: 'application/json; charset=utf-8',
                statusCode: {
                    200: function(data) {
                        getMerchantList(data, callback)
                    }
                }
            });
        }


        var getMerchantList = function(productData, callback) {

            var merchantListUrl = 'http://shop.monetizer101.com/shop-rest/api/v2.0/shop/2/merchant/list?isoCurrencyCode=CAD';

            $.ajax({
                url: merchantListUrl,
                type: 'GET',
                dataType: 'json',
                retryLimit: 3,
                contentType: 'application/json; charset=utf-8',
                statusCode: {
                    200: function(data) {
                        callback(data, productData);
                    }
                }
            });
        }

        getProducts(c);
    }

    var renderBanner = function(element, merchantList, adBlockCollection) {

        var template = null;

        var bannerType = $(element).attr('simba-type');

        if(!bannerType) return null;

        if(bannerType.toUpperCase() == 'BIG_BOX') { // Assume bigbox is true filler logic

            var adBlock = adBlockCollection[1];

            var m = findMerchant(merchantList, adBlock.merchantId);

            var bodyImg = _.template('<div class="productContainer"><img class="simbaAdImage" src="<%= src %>" alt="<%= alt %>" /></div>',
            {
                src: adBlock.imageURL,
                alt: adBlock.name
            });

            var metaData = _.template('<span class="brand"><%= merchant %></span>' +
                                      '<span class="description"><%= description %></span>' +
                                      '<span class="price">$<%= price %></span><span class="priceTag">&nbsp;</span><span class="link">Hurry &amp; Save!</span>',
                                       {
                                         merchant: m.name,
                                         description: adBlock.name,
                                         price: adBlock.salePrice
                                       });


            var template = _.template(
                '<div class="simbaBigBox">' +
                '<div class="smHeader"></div>' +
                '<div class="smBody">' +
                '<div class="smArrow"></div>' +
                '<%= bodyImg %>' +
                '<div class="meta"><div class="meta-inner"><%= metaData %></div>' +
                '<div class="nav" simba-position="1"><img src="/adgroups/bigbox/prev-btn.png" class="prev" /><img src="/adgroups/bigbox/next-btn.png" class="next" /></div>' +
                '</div></div>' +
                '<div class="smFooter"></div>', { bodyImg: bodyImg, metaData: metaData });
        }

        $(element).attr('data-url',adBlock.deepLink);
        $(element).append(template, null);
        $(element).find('.meta-inner').click(function() {

            var productUrl = $(element).attr('data-url');
            location.href = productUrl;
        });

        var cycleButtons = $(element).children().find('.prev, .next');

        var cycleAdblock = function() {

            var nav = $(this).parent();

            var clickPosition = parseInt($(nav).attr('simba-position'));

            if($(this).hasClass('next')) {

                clickPosition++;

                if(clickPosition == adBlockCollection.length) {
                    clickPosition = 0;
                }
            }

            if($(this).hasClass('prev')) {

                clickPosition--;

                if(clickPosition == -1) {
                    clickPosition = adBlockCollection.length - 1;
                }
            }

            var adBlock = adBlockCollection[clickPosition];
            var adBlockElement = $(this).parent().parent();

            var img = $(adBlockElement).parent().find('.simbaAdImage')[0];

            $(img).attr('src', adBlock.imageURL);
            $(img).attr('alt', adBlock.name);

            // console.log(adBlock.imageURL);

            $($(adBlockElement).find('.brand')[0]).text(m.name);
            $($(adBlockElement).find('.description')[0]).text(adBlock.name);
            $($(adBlockElement).find('.price')[0]).text('$' + adBlock.salePrice);

            // console.log($(adBlockElement).attr('data-url'));

            $(adBlockElement).attr('data-url', adBlock.deepLink);

            console.log(clickPosition);

            $(nav).attr('simba-position', clickPosition);
        }


        $(cycleButtons).click(cycleAdblock);
    }

    function refresh() {

        $('div[simba-deals]').each(function() {

            var code = $(this).attr('simba-deals');
            var element = this;

            queryForBanner(code, function(merchantList, adBlockCollection) {
                renderBanner(element, merchantList, adBlockCollection);
            });
        });
    }

    refresh();
};


/* Meta Data Reference */
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