simbaAdEngine = function($, _) {

    Number.prototype.currencyFormat = function(n, x) {
        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
        return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
    };

    String.prototype.truncate = function(m) {

        if(String.length >= m) return this;

        return (this.length > m)
            ? $.trim(this).substring(0, m).split(" ").slice(0, -1).join(" ") + "..."
            : this;
    };


    var findMerchant = function(merchantList, merchantId) {
        var m = $.grep(merchantList, function(m) {
            return m.id == merchantId;
        });

        var m = m[0];

        return m;
    }


    var queryForProducts = function(categoryCode, callback) {

        var getProducts = function(categoryCode) {
            var adUrl = "http://shop.monetizer101.com/shop-rest/api/v2.0/shop/2/widget/category?isoCurrencyCode=CAD&categoryId="
                        + categoryCode + "&productLimit=50";

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

        getProducts(categoryCode);
    }


    var renderBigBox = function(element, merchantList, adBlockCollection) {

        var adBlock = adBlockCollection[1];

        var m = findMerchant(merchantList, adBlock.merchantId);

        var bodyImg = _.template('<div class="simbaProductContainer"><img class="simbaAdImage" src="<%= src %>" alt="<%= alt %>" /></div>',
            {
                src: adBlock.imageURL,
                alt: adBlock.name
            });

        var metaData = _.template('<span class="simbaBrand"><%= merchant %></span>' +
                                  '<span class="simbaDescription"><%= description %></span>' +
                                  '<span class="simbaPrice">$<%= price %></span><span class="simbaPriceTag">&nbsp;</span><span class="simbaLink">Save Now</span>',
                                   {
                                     merchant: m.name,
                                     description: adBlock.name.truncate(50),
                                     price: parseInt(adBlock.salePrice).currencyFormat(2)
                                   });


        var template = _.template(
        	'<div class="BigBoxContainer">' +
            '<div class="simbaBigBox">' +
            '<div class="simbaHeader"></div>' +
            '<div class="simbaBody">' +
            '<div class="simbaArrow"></div>' +
            '<%= bodyImg %>' +
            '<div class="simbaMeta"><div class="simbaMetaInner"><%= metaData %></div>' +
            '<div class="simba-navigation" simba-position="1"><img src="http://simbadeals/gam/bigbox/prev-btn.png" class="simba-prev" /><img src="http://simbadeals/gam/bigbox/next-btn.png" class="simba-next" /></div>' +
            '</div></div>' +
            '<div class="simbaFooter"></div>' +
            '</div>', { bodyImg: bodyImg, metaData: metaData });



        $(element).empty();
        $(element).attr('data-url',adBlock.deepLink);
        $(element).append(template, null);
        $(element).find('.simbaProductContainer, .simbaMetaInner').click(function() {

            var productUrl = $(element).attr('data-url');
            location.href = productUrl;
        });


        var cycleButtons = $('.simbaBigBox').find('.simba-prev, .simba-next');

        var cycleAdblock = function() {

            var nav = $(this).parent();

            var clickPosition = parseInt($(nav).attr('simba-position'));

            if($(this).hasClass('simba-next')) {

                clickPosition++;

                if(clickPosition == adBlockCollection.length) {
                    clickPosition = 0;
                }
            }

            if($(this).hasClass('simba-prev')) {

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


            $($(adBlockElement).find('.simbaBrand')[0]).text(m.name);
            $($(adBlockElement).find('.simbaDescription')[0]).text(adBlock.name.truncate(50));
            $($(adBlockElement).find('.simbaPrice')[0]).text('$' + parseFloat(adBlock.salePrice).currencyFormat(2));

            $(element).attr('data-url', adBlock.deepLink);

            $(nav).attr('simba-position', clickPosition);

        }

        $(cycleButtons).click(cycleAdblock);

        setInterval(function() {
            $(element).find('.simba-next').trigger('click')
        }, 4500);
    }




    
    var renderLeaderBox = function(element, merchantList, adBlockCollection) {

        var adBlock = adBlockCollection[0];
        var renderLength = adBlockCollection.length > 5 ? 5 : adBlockCollection.length;

        var m = findMerchant(merchantList, adBlock.merchantId);

        var bodyImg = _.template('<div class="simbaProductContainer"><img class="simbaAdImage" src="<%= src %>" alt="<%= alt %>" /></div>',
            {
                src: adBlock.imageURL,
                alt: adBlock.name

            });

        var metaData = _.template('<span class="simbaBrand"><%= merchant %></span>' +
            '<span class="simbaDescription"><%= description %></span>' +
            '<span class="simbaPrice">$<%= price %></span><span class="simbaPriceTag">&nbsp;</span><span class="simbaLink">Save Now</span>',
            {
                merchant: m.name,
                description: adBlock.name.truncate(40),
                price: adBlock.salePrice
            });


        var renderBackProducts = function(adBlockCollection, filterPos) {

            var backProducts = '';

            for(var i = 0; i < renderLength; i++) {

                if(filterPos != i) {

                    var adBlock = adBlockCollection[i];

                    var backProduct = _.template('<div class="simbaBackProduct" data-ad-block-pos="<%= pos %>" ><img src="<%=src %>" alt="<%= alt %>" /></div>',
                    {
                        src: adBlock.imageURL,
                        alt: adBlock.name,
                        pos: i
                    });

                    backProducts += backProduct;
                }
            }

            return backProducts;
        }

        var template = _.template(
        	'<div class="LeaderContainer">' +
            '<div class="simbaLeader">' +
            '<div class="simbaFooter"></div>' +
            '<div class="simbaHeader">' +
                '<div class="simba-navigation" simba-position="0">' +
                    '<img src="http://simbadeals/gam/leader/prev-btn.png" class="simba-prev" /><img src="http://simbadeals/gam/leader/next-btn.png" class="simba-next" />' +
                '</div>' +
            '</div>' +
            '<div class="simbaBody">' +
                '<div class="arrow"></div>' +
                '<%= bodyImg %>' +
                '<div class="simbaMeta">' +
                    '<div class="simbaMetaInner"><%= metaData %></div>' +
                '</div>' +
                '<div class="simbaBackProducts"><%= backProducts %></div>' +
            '</div>' +
            '</div>' +
            '</div>', { metaData: metaData, bodyImg: bodyImg, backProducts: renderBackProducts(adBlockCollection, 0) });

        $(element).empty();
        $(element).attr('data-url',adBlock.deepLink);
        $(element).append(template, null);

        $(element).find('.simbaMetaInner').click(function() {
            var productUrl = $(element).attr('data-url');
            location.href = productUrl;
        });


        var cycleButtonsLeader = $('.simbaLeader').children().find('.simba-prev, .simba-next');

        var cycleAdblock = function() {

            var nav = $(this).parent();

            var clickPosition = parseInt($(nav).attr('simba-position'));

            if($(this).hasClass('simba-next')) {

                clickPosition++;

                if(clickPosition == renderLength) {
                    clickPosition = 0;
                }
            }

            if($(this).hasClass('simba-prev')) {

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

            $($(adBlockElement).find('.simbaBrand')[0]).text(m.name);
            $($(adBlockElement).find('.simbaDescription')[0]).text(adBlock.name.truncate(40));
            $($(adBlockElement).find('.simbaPrice')[0]).text('$' + parseFloat(adBlock.salePrice).currencyFormat(2));

            $(adBlockElement).parent().attr('data-url', adBlock.deepLink);

            $(nav).attr('simba-position', clickPosition);

            var backProducts = renderBackProducts(adBlockCollection, clickPosition);

            $('.simbaBackProducts > .simbaBackProduct').remove();
            $('.simbaBackProducts').append(backProducts, null);

            $('.simbaLeader > .simbaBody > .simbaBackProducts > .simbaBackProduct').click(backProductSelect);
        }


        var backProductSelect = function() {

            var pos = parseInt($(this).attr('data-ad-block-pos'));

            $('.simbaLeader > .simbaBody > .simbaBackProducts > .simbaProductContainer').remove();

            var backProducts = renderBackProducts(adBlockCollection, pos);

            $('.simbaBackProducts > .simbaBackProduct').remove();
            $('.simbaBackProducts').append(backProducts, null);

            var adBlock = adBlockCollection[pos];
            var img = $.find('.simbaAdImage')[0];

            $(img).attr('src', adBlock.imageURL);
            $(img).attr('alt', adBlock.name);

            $('.simbaLeader > .simbaBody > .simbaMeta .simbaMetaInner .simbaBrand').text(m.name);
            $('.simbaLeader > .simbaBody > .simbaMeta .simbaMetaInner .simbaDescription').text(adBlock.name.truncate(40));
            $('.simbaLeader > .simbaBody > .simbaMeta .simbaMetaInner .simbaPrice').text('$' + parseFloat(adBlock.salePrice).currencyFormat(2));

            $(element).attr('data-url',adBlock.deepLink);

            $('.simbaLeader > .simbaBody > .simbaBackProducts > .simbaBackProduct').click(backProductSelect);
        }

        $('.simbaLeader > .simbaBody > .simbaBackProducts > .simbaBackProduct').click(backProductSelect);


        $(cycleButtonsLeader).click(cycleAdblock);

        setInterval(function() {
            $(element).find('.simba-next').trigger('click')
        }, 4500);
    }


    var renderHalfPageBox = function(element, merchantList, adBlockCollection) {

        var template = _.template('' +
            '<div class="HalfPageContainer">' +
            '<div class="simbaHalfPage" simba-position="0">' +
            '<div class="simbaHeader"></div>' +
            '<div class="simbaBody">' +
            '</div>' +
            '<div class="simbaFooter"></div>' +
            '</div>' +
            '</div>');


        var renderProducts = function(merchantList, adBlockCollection, offset) {

            var productsHtml = '';

            for(var i = 0 + offset; i < 4 + offset; i++) {

                var adBlock = adBlockCollection[i];

                var m = findMerchant(merchantList, adBlock.merchantId);

                var nav = null;

                if(i == 3 + offset) {
                    nav = '<div class="simba-navigation">' +
                              '<img src="http://simbadeals/gam/halfpage/prev-btn.png" class="simba-prev">' +
                              '<img src="http://simbadeals/gam/halfpage/next-btn.png" class="simba-next">' +
                          '</div>';
                }

                var product = _.template('' +
                    '<div class="simbaProducts">' +
                    '<div class="simbaArrow"></div>' +
                    '<div class="simbaProductContainer simbaLink" data-url="<%= link %>">' +
                    '<img class="simbaAdImage" src="<%= src %>" alt="<%= alt %>" />' +
                    '</div>' +
                    '<div class="simbaMeta">' +
                    '<div class="meta-inner simbaLink" data-url="<%= link %>">' +
                    '<span class="simbaBrand"><%= merchant %></span>' +
                    '<span class="simbaDescription"><%= name %></span>' +
                    '<span class="simbaPrice">$<%= price %></span><span class="simbaPriceTag">&nbsp;</span><span class="simbaBangLine">Save Now</span>' +
                    '</div>' +
                    '<%= nav %>' +
                    '</div>' +
                    '</div>'+
                    '</div>',{ merchant: m.name,                    price: parseFloat(adBlock.salePrice).currencyFormat(2),
                                   name: adBlock.name.truncate(50),   alt: adBlock.name,
                                    src: adBlock.imageURL,           link: adBlock.deepLink, nav: nav });

                productsHtml += product;
            }

            var body = $(element).find('.simbaBody');
            $(body).empty();
            $(body).append(productsHtml);
        }

        $(element).empty();
        $(element).append(template);


        renderProducts(merchantList, adBlockCollection, 0);

        var cycleAds = function() {
            var clickPosition = parseInt($(element).find('.simbaHalfPage').attr('simba-position'));

            var max = merchantList.length  / 4;

            if($(this).hasClass('simba-next')) {

                if(clickPosition >= max - 2) {
                    clickPosition = 0;
                } else {
                    clickPosition++;
                }
            }

            if($(this).hasClass('simba-prev')) {

                clickPosition--;

                if(clickPosition == -1) {
                    clickPosition = max -2;
                }
            }

            $(element).find('.simbaHalfPage').attr('simba-position', clickPosition);

            var offset = clickPosition * 4;
            renderProducts(merchantList, adBlockCollection, offset);

            $(element).find('.simbaLink').click(function() {
                var productUrl = $(this).attr('data-url');
                location.href = productUrl;
            })

            $(element).find('.simba-prev, .simba-next').click(cycleAds);
        }

        $(element).find('.simba-prev, .simba-next').click(cycleAds);

        setInterval(function() {
            $(element).find('.simba-next').trigger('click')
        }, 4500);
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

                    if(bannerType == 'HALF_PAGE') {
                        renderHalfPageBox(element, merchantList, adBlockCollection);
                    }
                }
            });
        });
    }

    refresh();
};