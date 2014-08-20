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

    var shrinkToFit = function() {
        $('img.simbaAdImage').each(function(i, item) {
            var img_height = $(item).height();
            var div_height = $(item).parent().height();
            if(img_height<div_height){
                //IMAGE IS SHORTER THAN CONTAINER HEIGHT - CENTER IT VERTICALLY
                var newMargin = (div_height-img_height)/2+'px';
                $(item).css({'margin-top': newMargin });
            }else if(img_height>div_height){
                //IMAGE IS GREATER THAN CONTAINER HEIGHT - REDUCE HEIGHT TO CONTAINER MAX - SET WIDTH TO AUTO
                $(item).css({'width': 'auto', 'height': '100%'});
                //CENTER IT HORIZONTALLY
                var img_width = $(item).width();
                var div_width = $(item).parent().width();
                var newMargin = (div_width-img_width)/2+'px';
                $(item).css({'margin-left': newMargin});
            }
        });
    }


    var queryForProducts = function(categoryCode, callback) {

        //console.log(categoryCode);

        //if(!isNaN(categoryCode)) categoryCode = 'DEFAULT';



        var getProducts = function(c) {
            var adUrl = "http://shop.monetizer101.com/shop-rest/api/v2.0/shop/2/widget/category?isoCurrencyCode=CAD&categoryId="
                        + categoryCode + "&productLimit=5";

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
            '<div class="simbaBigBox">' +
            '<div class="simbaHeader"></div>' +
            '<div class="simbaBody">' +
            '<div class="simbaArrow"></div>' +
            '<%= bodyImg %>' +
            '<div class="simbaMeta"><div class="meta-inner"><%= metaData %></div>' +
            '<div class="simba-navigation" simba-position="1"><img src="http://simbadeals/adgroups/bigbox/prev-btn.png" class="simba-prev" /><img src="http://simbadeals/adgroups/bigbox/next-btn.png" class="simba-next" /></div>' +
            '</div></div>' +
            '<div class="simbaFooter"></div>', { bodyImg: bodyImg, metaData: metaData });


        $(element).attr('data-url',adBlock.deepLink);
        $(element).append(template, null);
        $(element).find('.simbaProductContainer, .meta-inner').click(function() {

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
            $($(adBlockElement).find('.price')[0]).text('$' + parseFloat(adBlock.salePrice).currencyFormat(2));

            $(adBlockElement).parent().parent().parent().attr('data-url', adBlock.deepLink);

            $(nav).attr('simba-position', clickPosition);

        }

        $(cycleButtons).click(cycleAdblock);

        setInterval(function() {
            $(element).find('.simba-next').trigger('click')
        }, 4500);
    }







    var renderLeaderBox = function(element, merchantList, adBlockCollection) {

        var adBlock = adBlockCollection[0];

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

            for(var i = 0; i < adBlockCollection.length; i++) {

                if(filterPos != i) {

                    var adBlock = adBlockCollection[i];

                    var backProduct = _.template('<div class="backProduct" data-ad-block-pos="<%= pos %>" ><img src="<%=src %>" alt="<%= alt %>" /></div>',
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
            '<div class="simbaLeader">' +
            '<div class="simbaFooter"></div>' +
            '<div class="simbaHeader">' +
                '<div class="simba-navigation" simba-position="0">' +
                    '<img src="http://simbadeals/adgroups/leader/prev-btn.png" class="simba-prev" /><img src="http://simbadeals/adgroups/leader/next-btn.png" class="simba-next" />' +
                '</div>' +
            '</div>' +
            '<div class="simbaBody">' +
                '<div class="arrow"></div>' +
                '<%= bodyImg %>' +
                '<div class="simbaMeta">' +
                    '<div class="meta-inner"><%= metaData %></div>' +
                '</div>' +
                '<div class="backProducts"><%= backProducts %></div>' +
            '</div>' +
            '</div>', { metaData: metaData, bodyImg: bodyImg, backProducts: renderBackProducts(adBlockCollection, 0) });

        $(element).attr('data-url',adBlock.deepLink);
        $(element).append(template, null);

        $(element).find('.meta-inner').click(function() {
            var productUrl = $(element).attr('data-url');
            location.href = productUrl;
        });


        var cycleButtonsLeader = $('.simbaLeader').children().find('.simba-prev, .simba-next');

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
            var adBlockElement = $(this).parent().parent().parent();

            var img = $(adBlockElement).parent().find('.simbaAdImage')[0];

            $(img).attr('src', adBlock.imageURL);
            $(img).attr('alt', adBlock.name);

            $($(adBlockElement).find('.simbaBrand')[0]).text(m.name);
            $($(adBlockElement).find('.simbaDescription')[0]).text(adBlock.name.truncate(40));
            $($(adBlockElement).find('.price')[0]).text('$' + parseFloat(adBlock.salePrice).currencyFormat(2));

            $(adBlockElement).parent().attr('data-url', adBlock.deepLink);

            $(nav).attr('simba-position', clickPosition);

            var backProducts = renderBackProducts(adBlockCollection, clickPosition);

            $('.backProducts > .backProduct').remove();
            $('.backProducts').append(backProducts, null);

            $('.simbaLeader > .simbaBody > .backProducts > .backProduct').click(backProductSelect);
        }


        var backProductSelect = function() {

            var pos = parseInt($(this).attr('data-ad-block-pos'));

            $('.simbaLeader > .simbaBody > .backProducts > .simbaProductContainer').remove();

            var backProducts = renderBackProducts(adBlockCollection, pos);

            $('.backProducts > .backProduct').remove();
            $('.backProducts').append(backProducts, null);

            var adBlock = adBlockCollection[pos];
            var img = $.find('.simbaAdImage')[0];

            $(img).attr('src', adBlock.imageURL);
            $(img).attr('alt', adBlock.name);

            $('.simbaLeader > .simbaBody > .simbaMeta .meta-inner .simbaBrand').text(m.name);
            $('.simbaLeader > .simbaBody > .simbaMeta .meta-inner .simbaDescription').text(adBlock.name.truncate(40));
            $('.simbaLeader > .simbaBody > .simbaMeta .meta-inner .price').text('$' + parseFloat(adBlock.salePrice).currencyFormat(2));

            $(element).attr('data-url',adBlock.deepLink);

            $('.simbaLeader > .simbaBody > .backProducts > .backProduct').click(backProductSelect);
        }

        $('.simbaLeader > .simbaBody > .backProducts > .backProduct').click(backProductSelect);


        $(cycleButtonsLeader).click(cycleAdblock);

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
                }
            });
        });

        shrinkToFit();
    }

    refresh();
};
