simbaAdEngine = function($, _) {

    var categoryCodes = [
        { code: 'SOME_AD_CODE', categoryId: '134217728', productCount: 5 }
    ];

    var findMerchant = function(merchantList, merchantId) {
        var m = $.grep(merchantList, function(m) {
            return m.id == merchantId;
        });

        if(m.length == 1) {
            return m[0];
        }

        return null;
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

            var adBlock = adBlockCollection[0];

            var m = findMerchant(merchantList, adBlock.merchantId);

            var bodyImg = _.template('<div style="productContainer"><img class="simbaAdImage" src="<%= src %>" alt="<%= alt %>" /></div>',
            {
                src: adBlock.imageURL,
                alt: adBlock.name
            });

            var metaData = _.template('<span class="brand"><%= merchant %></span>' +
                                      '<span class="description"><%= description %></span>' +
                                      '<span class="price">$<%= price %></span><span class="priceTag">&nbsp;</span>',
                                       {
                                         merchant: m.name,
                                         description: adBlock.name,
                                         price: adBlock.salePrice
                                       });

            var template = _.template(
                '<div class="simbaBigBox">' +
                '<div class="smHeader"></div>' +
                '<div class="smBody">' +
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


            console.log(productUrl);


            //location.href = productUrl;
        });

        var cycleButtons = $(element).children().find('.prev, .next');

        var cycleAd = function() {

            var nav = $(this).parent();

            var clickPosition = parseInt($(nav).attr('simba-position'));

            var adBlock = adBlockCollection[clickPosition];
            var adBlockElement = $(this).parent().parent();

            var img = $(adBlockElement).parent().find('.simbaAdImage')[0];

            $(img).attr('src', adBlock.imageURL);
            $(img).attr('alt', adBlock.name);

            console.log(adBlock.imageURL);

            $($(adBlockElement).find('.brand')[0]).text(m.name);
            $($(adBlockElement).find('.description')[0]).text(adBlock.name);
            $($(adBlockElement).find('.price')[0]).text('$' + adBlock.salePrice);

            console.log($(adBlockElement).attr('data-url'));

            $(adBlockElement).attr('data-url', adBlock.deepLink);

            clickPosition++;
            $(nav).attr('simba-position', clickPosition);



            console.log(clickPosition);

            if(clickPosition == adBlockCollection.length) {
                $(nav).attr('simba-position', 0);
            }
        }

        $(cycleButtons).click(cycleAd);
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