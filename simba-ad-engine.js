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

    var queryForProducts = function(categoryCode, callback) {

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

    var renderBigBox = function(element, merchantList, adBlockCollection) {

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


        $(element).attr('data-url',adBlock.deepLink);
        $(element).append(template, null);
        $(element).find('.productContainer, .meta-inner').click(function() {

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


            $($(adBlockElement).find('.brand')[0]).text(m.name);
            $($(adBlockElement).find('.description')[0]).text(adBlock.name);
            $($(adBlockElement).find('.price')[0]).text('$' + adBlock.salePrice);

            $(adBlockElement).parent().parent().parent().attr('data-url', adBlock.deepLink);

            $(nav).attr('simba-position', clickPosition);

        }

        $(cycleButtons).click(cycleAdblock);
    }

    var renderLeaderBox = function(element, merchantList, adBlockCollection) {

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


        $(element).attr('data-url',adBlock.deepLink);
        $(element).append(template, null);
        $(element).find('.productContainer, .meta-inner').click(function() {

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


            $($(adBlockElement).find('.brand')[0]).text(m.name);
            $($(adBlockElement).find('.description')[0]).text(adBlock.name);
            $($(adBlockElement).find('.price')[0]).text('$' + adBlock.salePrice);

            $(adBlockElement).parent().parent().parent().attr('data-url', adBlock.deepLink);

            $(nav).attr('simba-position', clickPosition);

        }

        $(cycleButtons).click(cycleAdblock);
    }

    function refresh() {

        $('div[simba-deals]').each(function() {

            var code = $(this).attr('simba-deals');
            var element = this;

            queryForProducts(code, function(merchantList, adBlockCollection) {

                var bannerType = $(element).attr('simba-type');

                if(bannerType) {

                    bannerType = bannerType.toUpperCase();

                    if(bannerType == 'BIG_BOX') { // Assume bigbox is true filler logic

                        renderBigBox(element, merchantList, adBlockCollection);
                    }

                    if(bannerType == 'LEADER_BOX') { // Assume bigbox is true filler logic

                        renderLeaderBox(element, merchantList, adBlockCollection);
                    }
                }
            });
        });
    }

    refresh();
};