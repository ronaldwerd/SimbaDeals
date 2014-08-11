simbaAdEngine = function($, _) {

    Number.prototype.currencyFormat = function(n, x) {
        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
        return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
    };

    String.prototype.truncate = function(m) {
        return (this.length > m)
            ? $.trim(this).substring(0, m).split(" ").slice(0, -1).join(" ") + "..."
            : this;
    };

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
                                     price: parseInt(adBlock.salePrice).currencyFormat(2)
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
            $($(adBlockElement).find('.price')[0]).text('$' + parseInt(adBlock.salePrice).currencyFormat(2));

            $(adBlockElement).parent().parent().parent().attr('data-url', adBlock.deepLink);

            $(nav).attr('simba-position', clickPosition);

        }

        $(cycleButtons).click(cycleAdblock);

        setInterval(function() {
            $('.next').trigger('click')
        }, 3500);
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
                merchant: m.name.truncate(40),
                description: adBlock.name,
                price: adBlock.salePrice
            });

        var template = _.template(
            '<div class="simbaLeader">' +
            '<div class="smFooter"></div>' +
            '<div class="smHeader">' +
                '<div class="nav" simba-position="1">' +
                    '<img src="/adgroups/leader/prev-btn.png" class="prev" /><img src="/adgroups/leader/next-btn.png" class="next" />' +
                '</div>' +
            '</div>' +
            '<div class="smBody">' +
                '<div class="arrow"></div>' +
                '<%= bodyImg %>' +
                '<div class="meta">' +
                    '<div class="meta-inner"><%= metaData %></div>' +
                '</div>' +
                '<div class="productContainer"><img src="adgroups/leader/productImg.png" alt="#" /></div>' +
                '<div class="productContainer"><img src="adgroups/leader/productImg.png" alt="#" /></div>' +
                '<div class="productContainer"><img src="adgroups/leader/productImg.png" alt="#" /></div>' +
                '<div class="productContainer"><img src="adgroups/leader/productImg.png" alt="#" /></div>' +
            '</div>' +
            '</div>', { metaData: metaData, bodyImg: bodyImg});


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
            var adBlockElement = $(this).parent().parent().parent();

            var img = $(adBlockElement).parent().find('.simbaAdImage')[0];

            $(img).attr('src', adBlock.imageURL);
            $(img).attr('alt', adBlock.name);


            //console.log(adBlockElement);

            $($(adBlockElement).find('.brand')[0]).text(m.name);
            $($(adBlockElement).find('.description')[0]).text(adBlock.name.truncate(40));
            $($(adBlockElement).find('.price')[0]).text('$' + adBlock.salePrice);

            $(adBlockElement).parent().attr('data-url', adBlock.deepLink);

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

                    if(bannerType == 'BIG_BOX') {
                        renderBigBox(element, merchantList, adBlockCollection);
                    }

                    if(bannerType == 'LEADER') {
                        renderLeaderBox(element, merchantList, adBlockCollection);
                    }
                }
            });
        });
    }

    refresh();
};