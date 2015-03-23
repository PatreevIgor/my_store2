/* корзина */
function cartTriggers(){
   var open_cart_total = $('.total_amount_s').html()

  // Удаление
  $(".cart-table .del a").each(function(i) {
      if ( $(this).attr('in_process') ) { return; }
    $(this).attr('in_process',true);

    $(this).bind("click dblclick", function(e){
            e.preventDefault();

          var link = $(this);
        if ( link.attr('processed') ) { return false; }

        if ( confirm("Уверены, что хотите удалить товар?") ) {

                link.attr('processed',true);

                e.preventDefault();
                var item_row = link.parents("tr:first");
                var fields =  new Object;
                fields['_method'] = 'delete';
                var path = '/cart_items/'+link.attr("iid").replace("delete_","")+'.json';

          show_preloader();

          $.ajax({
              url:      path,
              type:     'post',
              data:     fields,
              dataType: 'json',
              success:  function(response) {

                  link.attr('processed',false);
              hide_preloader(); // Убираем прелоадер

              if( response.total_price == 0 ){
                $("#cartform").hide();
                $(".cart-message").show();
              }

              item_row.slideUp("normal", function(){
                  item_row.remove();

                  /* Переставляем индекс */
                            $("#cartform table td.index:visible").each(function(i){
                                $(this).html((i+1)+".");
                            });
                  });

              $('.total_amount').html(InSales.formatMoney(response.total_price, cv_currency_format));  
                 if( response.items_count > 0){
                   $('.cart-inner').html('<span class="cart_items_price">' + InSales.formatMoney(response.total_price, cv_currency_format) + '</span> <span class="cart_items_count">' + response.items_count + '</span>')
                 }
                else {
                  $('.cart-inner').html('<i>Корзина пуста</i>');
                }
              },
              error:  function(response) {
                if ( link.attr('processed') ) { return false; }
                  link.attr('processed',false);
                // alert("произошла ошибка");
              }
          });
        }
      return false;
    });
  });

    // Пересчитать
    // Массив для хранения
    qSwaps = [];

    $(".cart-table .quantity input").each(function(i){
        qSwaps[i] = $(this).val();
    });

    $(".cart-table .quantity input").each(function(i) {
        if ( $(this).attr('processed') ) { return; }
        $(this).attr('processed',true);
        $(this).bind("change keyup", function(e) {
            var el = $(this);
            var value = el.val();

            val = value.replace(/[^\d\.\,]+/g,'');
            if (val < 0){ /* nothing to do */ }
            if(val != value) el.val(val);

            if (val == qSwaps[i]) return; // если значение не изменилось - выходим

            qSwaps[i] = val;

            el.parents("tr:first").find(".total-price strong").html( InSales.formatMoney(val*el.attr('price'), cv_currency_format) )
            recalculate_order();
        }).bind('blur',function(){
            var el = $(this);
            var value = el.val();
            val = value.replace(/[^\d\.\,]+/g,'');
            if (val < 0 || val == ""){ val = 0; }
            el.val(val);

            el.change();
        });
    });


   function recalculate_order() {
        var fields = new Object;
        fields = $('#cartform').serialize();        
        var path = '/cart_items/update_all.json'

        show_preloader(); // Показываем прелоадер

        $.ajax({
          url: path,
          type: 'post',
          data: fields,
          dataType: 'json',
          success: function (response) {
			  
			  if(response.discount_description){
				$.each(response.discounts, function(){
					var item = this;
					var description = item.description
					var price = InSales.formatMoney(item.amount, cv_currency_format)
					$('.discounts-list').html('<div class="item">'+description+': &minus;<span class="price">'+price+'</span></div>')
				})  
				$('.discounts-list').slideDown(); 
			  }else{
			    $('.discounts-list').slideUp().html(''); 
			  }

            hide_preloader(); // Убираем прелоадер
            $.each(response.items, function (i) {
              var item = this;
              $('tr[id="cart_order_line_' + item.variant_id + '"]').find('.sale-price').html(InSales.formatMoney(item.sale_price, cv_currency_format));
              $('tr[id="cart_order_line_' + item.variant_id + '"]').find('.total-price').html(InSales.formatMoney(item.total_price, cv_currency_format));
            });
           
            $('.total_amount').html(InSales.formatMoney(response.total_price, cv_currency_format));
            if (response.items_count > 0) {
              $('.cart-inner').html('<span class="cart_items_price">' + InSales.formatMoney(response.total_price, cv_currency_format) + '</span> <span class="cart_items_count">' + response.items_count + '</span>')
              $('.busket__count').html(response.items_count);
            } else {
              $('.cart-inner').html('<i>Корзина пуста</i>');
            }            
          },
          error: function (response) {
            alert("произошла ошибка");
            hide_preloader();
          }
        });
      }
  }

function getParam(sParamName){
    var Params = location.search.substring(1).split("&");
    var variable = "";
    for (var i = 0; i < Params.length; i++){
      if (Params[i].split("=")[0] == sParamName){
        if (Params[i].split("=").length > 1) variable = Params[i].split("=")[1];
        return variable;
      }
    }
    return "";
}

var rc_total_count = 0;

function recalc_offer_price(){
  rc_total_count = 0;

  $('.product-variants input:enabled').each(function(){
    var val = $(this).val();
    if (isNaN(val) || val < 0){
      val = 0; $(this).val(val);
      }
    rc_total_count = rc_total_count + $(this).attr("price")*val;
  });
  $("#price-field").html( InSales.formatMoney(rc_total_count, cv_currency_format));
}