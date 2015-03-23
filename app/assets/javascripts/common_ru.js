function compact(array) {
    var new_array = [];
    for (var i = 0; i < array.length; i++) {
        if ( array[i] ) new_array.push(array[i]);
    }
    return new_array;
}

function calculate_total_cost(product, variant, quantity) {
  if(product.using_price_types) {
    var price = variant.price;
    var price_type;
    for(var j in product.price_types) {
        if ( product.price_types[j].min_quantity > quantity )
            break;
        price_type = product.price_types[j];
    }
    if (price_type) {
        for(var i in variant.prices) {
            if ( variant.prices[i].price_type_id == price_type.id ) {
                price = variant.prices[i].price;
                break;
            }
        }
    }
    return price*quantity;
  } else {
    var price = variant.price;
    var price_kind;
    var price_kinds = product.price_kinds.sort(function(a,b){
      return a.value - b.value;
    });

    for(var j in price_kinds) {
        if ( price_kinds[j].value > quantity )
            break;
        if( variant.prices[product.price_kinds[j].price_index - 1] ){
          price_kind = product.price_kinds[j];
        }
    }
    if (price_kind) {
        price = variant.prices[price_kind.price_index - 1];
    }
    return price*quantity;
  }
}

function get_prices(product, variant) {
  if(product.using_price_types) {
    var price_by_type = {};
    for(var i in variant.prices) {
        var price = variant.prices[i];
        price_by_type[price.price_type_id] = price;
    }
    var previous = null;
    var table = []
    for(var j in product.price_types) {
        var price_type = product.price_types[j];
        var price = variant.price;
        var to = price_type.min_quantity - 1;
        var from = 1;
        if (previous) {
            price = price_by_type[previous.id].price;
            from = previous.min_quantity;
        }
        table.push({ from: from, to: to, price: price});
        previous = price_type;
    }
    if (previous) {
        table.push({ from: previous.min_quantity, to: null, price: price_by_type[previous.id].price});
        return table;
    } else {
        return false;
    }
  } else {
    var prices = variant.prices;
    var previous = null;
    var table = [];
    var price_kinds = product.price_kinds.sort(function(a,b){
      return a.value - b.value;
    });

    for(var j in price_kinds) {
        var price_kind = price_kinds[j];
        if(prices[price_kind.price_index - 1]){
          var price = variant.price;
          var to = price_kind.value - 1;
          var from = 1;
          if (previous) {
              price = prices[previous.price_index-1];
              from = previous.value;
          }
          table.push({ from: from, to: to, price: price});
          previous = price_kind;
        }
    }
    if (previous) {
        table.push({ from: previous.value, to: null, price: prices[previous.price_index - 1]});
        return table;
    } else {
        return false;
    }
  }
}

if ((typeof InSales) == 'undefined') {
    var InSales = {};
}

InSales.isDefined = function(obj) {
  return ((typeof obj == 'undefined') ? false : true);
};

InSales.money_format = "{{amount}} "+"\u0440\u0443\u0431.";

/*
   number - number to add delimiter
   delimiter - value to use as digits delimiter (e.g. delimiter = '-'; 1000 -> 1-000)
*/
InSales.numberWithDelimiter = function(number, delimiter) {
    if (delimiter == undefined) delimiter = ' ';
    number+=''
    var split = number.split('.');
    split[0] = split[0].replace(
        /(\d)(?=(\d\d\d)+(?!\d))/g,
        '$1'+delimiter
    );
    return split.join('.');
}

// Старая версия функции formatMoney, оставлена для совместимости
InSales.formatMoneyOld = function(amount, format) {
    var patt = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || this.money_format);
    // формат вывода должен совпадать c форматом вывода в Liquid
    value = floatToString(amount, 2).replace(/,00/, '').replace(/\.00/, '');
    return formatString.replace(patt, value);
}

// в старой версии функции параметры приходили через string, в новой в виде JSON
InSales.formatMoneyIsOld = function(params) {
    var oldFormat = false;
    // проверка что в params JSON через try для jQuery > 1.9
    try {
      var moneyParams = $.parseJSON(params);
      // проверка старым способом для jQuery <= 1.9
      if ( moneyParams == null || typeof moneyParams != 'object') oldFormat = true;
    } catch(err) {
      oldFormat = true;
    }
    return oldFormat;
}

InSales.formatMoney = function(amount, params) {
    if (amount == null) return '';
    if (params == null && window.CURRENCY_FORMAT) params = CURRENCY_FORMAT;
    if (params == null && window.cv_currency_format) params = cv_currency_format;
    //FIXME оставлено для совместимости
    // если приходит JSON - используем эту функцие, если нет - старую версию функции
    if (this.formatMoneyIsOld(params)) return this.formatMoneyOld(amount, params);

    amount = parseFloat(amount).toFixed(2) || 0;
    if (typeof amount == 'string') amount = amount.replace(/\.00/, '');

    var moneyParams = $.parseJSON(params);
    value = moneyParams['show_price_without_cents'] ? Math.round(amount) : amount;
    value = this.numberWithDelimiter(value, moneyParams['delimiter']);
    value = value.replace(/\./, moneyParams['separator']);
    return moneyParams['format'].replace('%n', value).replace('%u',moneyParams['unit']);
};

InSales.OrderLine = function(options) {
      this.init = function(options) {
          var line = this;
          $.each(options, function(key,value) { line[key] = value; });
          if (options.title) this.title = options.title.replace(/\+/g, ' ');
          if (options.sku) this.sku = options.sku.replace(/\+/g, ' ');
          this.url = '/product/?product_id=' + options.product_id;
      }

      this.image = function(format) {
          return this.image_url.replace('thumb', format);
      }

      this.init(options);
      return this;
}

InSales.Cart = function(drawCallback, format) {
    var cart = this;
    this.get_text = function(text) {
        if (!text) return text;
        return text.replace(/\+/g, ' ');
    }

    this.setCart = function(order) {
        if (!order) {
            this.total_price = 0;
            this.items_price = 0;
            this.order_lines = [];
            this.items_count = 0;
            this.discounts = [];
            return;
        }
        this.total_price = order.total_price;
        this.items_price = order.items_price;
        var items_count = 0;
        var order_lines = [];
        $(order.order_lines).each(function(index, order_line) {
            items_count += order_line.quantity;
            order_lines[index] = new InSales.OrderLine(order_line);
        });
        this.order_lines = order_lines;
        this.items_count = items_count;
        this.discounts = order.discounts;
        this.discount_code = order.discount_code;
    }

    this.reloadCart = function(callback) {
        if ($.cookie('cart') != 'json') {
            try {
              var cart_json = $.parseJSON($.cookie('cart'));
            } catch(e) {
              var cart_json = null;
            }
            cart.setCart(cart_json);
            callback();
        } else {
            $.ajax({
                url: "/cart_items.json",
                dateType: 'json',
                success: function(order){
                    cart.setCart(order);
                    callback();
                }
            });
        }
    }

    this.removeItemTrigger = function(){
        $('[id^="delete_"]').each(function(i) {
            if ( $(this).attr('processed') ) { return; }
            $(this).attr('processed',true);
            var link = $(this);
            var variant_id = link.attr("id").replace("delete_","");

            $(this).click(function(e){
                e.preventDefault();
                cart.removeItem(variant_id);
           });
      });
    }

    this.removeItem = function(variant_id) {
        var fields =  new Object;
        fields['_method'] = 'delete';
        var path   = '/cart_items/' + variant_id + '.json';
        show_preloader();
        $.ajax({
            url:      path,
            type:     'post',
            data:     fields,
            dataType: 'json',
            success:  function(response) {
                cart.reloadCart(function(){
                    hide_preloader();
                    cart.draw();
                });
            },
            error:  function(response) {
                hide_preloader();
                console.log("Cant remove item from cart");
            }
        });
    }

    this.addCallback = function() {
        this.reloadCart(function(){
            cart.draw();
            set_preloaders_message('<div id="add_product_notification">'+"\u0422\u043e\u0432\u0430\u0440 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d \u0432 \u043a\u043e\u0440\u0437\u0438\u043d\u0443"+'</div>');
            window.setTimeout( hide_preloader, 1000);
        });
    }

    this.draw = function() {
        this.drawCallback(this);
        this.removeItemTrigger();
    }

    this.init = function(options) {
        this.drawCallback = options.draw;
        this.selector = options.selector;
        this.format = format;
        this.reloadCart(function(){
            cart.draw();
            initAjaxAddToCartButton(cart.selector, function(response){ cart.addCallback(); });
        });
    }

    this.init(drawCallback);
}

/*
  свои сообщения можно передать через options
  { _textAdd: '', _textLink: '', _textRepeat: '', _textCompareEnd: '' }
*/
InSales.Compare = function(options) {
  /* Сообщения по умолчанию */
  var textAdd = "\u0422\u043e\u0432\u0430\u0440 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d \u043a \u0441\u0440\u0430\u0432\u043d\u0435\u043d\u0438\u044e";
  var textLink = "\u0421\u0440\u0430\u0432\u043d\u0438\u0442\u044c";
  var textRepeat = "\u042d\u0442\u043e\u0442 \u0442\u043e\u0432\u0430\u0440 \u0443\u0436\u0435 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d";
  var textCompareEnd = "\u0421\u0440\u0430\u0432\u043d\u0438\u0432\u0430\u0442\u044c \u043c\u043e\u0436\u043d\u043e \u043d\u0435 \u0431\u043e\u043b\u0435\u0435 4-\u0445 \u0442\u043e\u0432\u0430\u0440\u043e\u0432";

  var compare = this;
  var productsCounter = 0;
  var ProductId = 0;
  var ProductIdRepeat = false;

  this.otherText = function() {
    if(this._textAdd) {
      textAdd = this._textAdd;
    }
    if(this._textLink) {
      textLink = this._textLink;
    }
    if(this._textRepeat) {
      textRepeat = this._textRepeat;
    }
    if(this._textCompareEnd) {
      textCompareEnd = this._textCompareEnd;
    }
  }

  this.get_text = function(text) {
    if (!text) return text;
    return text.replace(/\+/g, ' ');
  }

  this.reload = function() {
    try {
      this.products = $.parseJSON($.cookie('compare'));
    } catch(e) {
      this.products = null;
    }

    if (!this.products) {
      this.products = [];
        return;
      }

      productsCounter = this.products.length;

      $(this.products).each(function(index, product) {
        $('a[rel='+this.id+']').not('.del_compare').text(""+textAdd+"").addClass('compare-added');
        product['title'] = compare.get_text(product['title']);
      });
    }

    this.removeItemTrigger = function(){
      $('.remove_compare').each(function(i) {
        if ( $(this).attr('processed') ) { return; }
        $(this).attr('processed',true);
        var product_id = $(this).attr('rel');

        $(this).click(function(e){
          e.preventDefault();
          compare.removeItem(product_id);
        });
      });
    }

    this.removeItem = function(product_id) {
      var fields =  new Object;
      fields['_method'] = 'delete';
      var path   = '/compares/' + product_id + '.json';
      show_preloader();
      $.ajax({
        url:      path,
        type:     'post',
        data:     fields,
        dataType: 'json',
        success:  function(response) {
          $('.compare_' + product_id).remove();
          $('a[rel='+product_id+']').text(""+textLink+"").removeClass('compare-added');
          compare.reload();
          hide_preloader();
          compare.draw();
        },
        error:  function(response) {
          hide_preloader();
        }
      });
    }

    this.addItemTrigger = function() {
      $(this.selector).live('click', function(){
        productsCounter = productsCounter+1
        var product_id = $(this).attr('rel');
        var path   = '/compares.json';

        ProductId = product_id;

        compare.checkIsRepeated();
        show_preloader();

        if(productsCounter > 4) {
          set_preloaders_message('<div id="add_product_notification">'+textCompareEnd+'</div>');
          window.setTimeout(hide_preloader, 3000);
        } else {
          $(this).text(""+textAdd+"").addClass('compare-added');
          $.ajax({
            url:      path,
            type:     'post',
            data:     {'product[id]': product_id},
            dataType: 'json',
            success:  function(response) {
              compare.reload();
              compare.draw();
              if (ProductIdRepeat == true) {
                set_preloaders_message('<div id="add_product_notification">'+textRepeat+'</div>');
                window.setTimeout(hide_preloader, 3000);
              } else {
                set_preloaders_message('<div id="add_product_notification">'+textAdd+'</div>');
                window.setTimeout(hide_preloader, 3000);
              }
            },
            error:  function(response) {
              hide_preloader();
            }
          });
        }
      });
    }

    this.draw = function() {
      this.drawCallback(this.products);
      this.removeItemTrigger();
    }

    this.checkIsRepeated = function() {
      ProductIdRepeat = false;
      $.each(this.products, function() {
        if(ProductId == this.id) {
          ProductIdRepeat = true;
          return false;
        } else {
          ProductIdRepeat = false;
        }
      });
    }

    this.init = function(options) {
      this.drawCallback = options.draw;
      this.selector = options.selector;
      this._textAdd = options._textAdd;
      this._textLink = options._textLink;
      this._textRepeat = options._textRepeat;
      this._textCompareEnd = options._textCompareEnd;
      this.otherText();
      this.reload();
      this.draw();
      this.addItemTrigger();
    }

    this.init(options);
}

function floatToString(numeric, decimals) {
    numeric = parseFloat(numeric) || 0;
    var amount = numeric.toFixed(decimals).toString();
    if(amount.match(/^\.\d+/)) {return "0"+amount;}
    else {return amount;}
};

InSales.Product = function(json) {

    // Вспомогательные методы используемые при инициализации
    this.addOption = function(option) {
        this.options_by_id[option['id']] = {
            title: option['title'],
            values: []
        };
    };

    this.addVariant = function(variant) {
        var option_values = variant['option_values'];
        for (var value in option_values) {this.addValue(option_values[value]);};
    };

    this.addValue = function(value) {
        var option = this.options_by_id[value['option_name_id']];
        option['values'][value['position']] = value;
    };

    // Инициализация
    this.init = function(json) {
        for (property in json) {this[property] = json[property];}
        this.options_by_id = {};
        for (var option  in this.option_names) {this.addOption(this.option_names[option]);}
        for (var variant in this.variants)  {this.addVariant(this.variants[variant]);};
        jQuery.each(this.options_by_id, function(index,option) {option['values'] = compact(option['values']);});

    };

    // returns array of option names for product
    this.optionNames = function() {
        return this.option_names;
    };

    // returns array of all option values (in order) for a given option name index
    this.optionValues = function(index) {
        var option = this.option_names[index];
        if (!option) {return null;}
        return this.options_by_id[option['id']]['values'];
    };

    // return the variant object if exists with given values, otherwise return null
    this.getVariant = function(selectedValues) {
        for (var i in this.variants) {
            var variant = this.variants[i];
            var satisfied = true;
            jQuery.each(variant['option_values'], function(index,value) {
                if (selectedValues[value['option_name_id']] != value['id']) {
                    satisfied = false;
                }
            });
            if (satisfied == true) {return variant;}
        }
        return null;
    };

    this.variantById = function(id) {
        for (var i in this.variants) {
            if (this.variants[i].id == id) {
                return this.variants[i];
            }
        }

        return null;
    };

    this.init(json);
};

InSales.OptionSelectors = function(existingSelectorId, options) {
    if ($("#"+existingSelectorId).attr("id") == undefined) return false;

    // insert new multi-selectors and hide original selector
    this.replaceSelector = function(domId) {
        var oldSelector = document.getElementById(domId);
        var parent = oldSelector.parentNode;
        jQuery.each(this.buildSelectors(), function(index,el) {
            parent.insertBefore(el, oldSelector);
        });
        oldSelector.style.display = 'none';
        this.variantIdField = oldSelector;
    };

    // buildSelectors(index)
    // create and return new selector element for given option
    this.buildSelectors = function() {
        // build selectors
        for (var i = 0; i < this.product.optionNames().length; i++) {
            var sel = new InSales.SingleOptionSelector(this, i, this.product.optionNames()[i], this.product.optionValues(i));
            sel.element.disabled = false;
            this.selectors.push(sel);
        }

        // replace existing selector with new selectors, new hidden input field, new hidden messageElement
        var divClass = this.selectorDivClass;
        var divId = this.optionIdFieldIdPrefix
        var optionNames = this.product.optionNames();
        var elements = [];
        jQuery.each(this.selectors, function(index,selector) {
            var div = document.createElement('div');
            div.setAttribute('class', divClass);
            div.setAttribute('id', divId + selector.option_id)
            // create label if more than 1 option (ie: more than one drop down)
            if (optionNames.length > 1 || optionNames[0].title != 'Модификация') {
                // create and appened a label into div
                var label = document.createElement('label');
                label.innerHTML = selector.name;
                div.appendChild(label);
            }
            div.appendChild(selector.element);
            elements.push(div);
        });
        return elements;
    };

    // returns array of currently selected values from all multiselectors
    this.selectedValues = function() {
        var currValues = {};
        for (var i = 0; i < this.selectors.length; i++) {
            var selector = this.selectors[i]
            var thisValue = selector.element.value;
            currValues[selector.option_id] = thisValue;
        }
        return currValues;
    };

    this.getCurrVariant = function() {
        var currValues = this.selectedValues(); // get current values
        return this.product.getVariant(currValues);
    };

    // callback when a selector is updated.
    this.updateSelectors = function(index) {
        var variant    = this.getCurrVariant();
        if (variant) {
            this.variantIdField.disabled = false;
            this.variantIdField.value = variant.id; // update hidden selector with new variant id
        } else {
            this.variantIdField.disabled = true;
        }
        this.onVariantSelected(variant, this);  // callback
    };

    this.selectAvailableVariant = function() {
        var values = {};
        for (var i = 0; i < this.product.variants.length; i++) {
            var variant = this.product.variants[i];
            if (!variant.available) continue;
            jQuery.each(variant.option_values, function(index,option_value) {
                values[option_value.option_name_id] = option_value.id;
            });
            break;
        }
        jQuery.each(this.selectors, function(index,selector) {
            selector.selectValue(values[selector.option_id]);
        });
        this.selectors[0].element.onchange();     // init the new dropdown
    };

    this.filterOptionValues = function(){
        // Создаём массив значений св-в каждой модификации
        var variants_option_values = [];
        for (var i = 0; i < this.product.variants.length; i++) {
            var variant = this.product.variants[i];
            //if (!variant.available) continue;
            var variant_option_values = []
            jQuery.each(variant.option_values, function(index,option_value) {
                variant_option_values.push(option_value);
            });
            variants_option_values.push(variant_option_values)
        }

        var id_prefix = 'variant-select-option-';
        var max_option_name_index = jQuery('.single-option-selector').size() - 1;
        // При выборе значения св-ва у следующего св-ва оставляем только те значения, которые могут быть у товара при выбранных предыдущих значениях
        jQuery('.single-option-selector').live('change',function(){
            var selected_option_value_id = jQuery(this).val();
            var id = jQuery(this).attr('id');
            var option_name_index = parseInt(id.replace(id_prefix,''));
            if (option_name_index == max_option_name_index) return;
            var next_option_name_index = option_name_index + 1;
            var option_values = [];
            jQuery.each(variants_option_values, function(index,variant_option_values){
                var current_option_value = variant_option_values[option_name_index];
                if (current_option_value.id == selected_option_value_id) {
                    var allowed_option_value = true
                    // проходимся по ранее выбранным значениям св-в
                    for (var i=option_name_index; i >= 0; i--){
                        var prev_current_option_value_id = jQuery("#"+id_prefix+i).val();
                        if (variant_option_values[i].id != prev_current_option_value_id) allowed_option_value = false;
                    }
                    if (allowed_option_value){
                        var next_option_value = variant_option_values[next_option_name_index];
                        option_values = jQuery.grep(option_values, function (option_value) {return option_value.id != next_option_value.id;});
                        option_values.push(next_option_value);
                    }
                }
            });

            var next_option_values_select = jQuery("#"+id_prefix+next_option_name_index);
            var next_selected_option_value_id = next_option_values_select.val();

            var options = "";
            jQuery.each(option_values, function(){
                var selected = "";
                if (this.id == next_selected_option_value_id) selected = "selected='selected'";
                options += "<option value='"+this.id+"' "+ selected +">"+this.title+"</option>";
            });

            next_option_values_select.html(options);
            next_option_values_select.trigger('change');
        });

        $("#"+id_prefix+0).trigger('change');
    }

    this.getUrlParameter = function(name) {
      return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [0, null])[1]);
    };

    // если модификация указана в URL выбираем её
    this.selectVariantFromUrl = function() {
      var variant_id = this.getUrlParameter('variant_id');
      if (variant_id == null) return;

      // if(variant_id != 'null') {
      //   $('select option[value="'+ this.getUrlParameter('variant_id') +'"]').attr('selected', 'selected').change();
      // }

      var variant = this.product.variantById(variant_id);
      if (variant == null) return;

      for (var i in variant.option_values) {
          var opt_id = variant.option_values[i].id;
          $(this.variantIdField).parent().find('select option[value="' + opt_id + '"]').attr('selected', 'selected');
      }

      this.updateSelectors();
    };

    this.selectorDivClass       = 'selector-wrapper';
    this.selectorClass          = 'single-option-selector';
    this.variantIdFieldIdSuffix = '-variant-id';
    this.optionIdFieldIdPrefix  = 'selector-option-id-';

    this.variantIdField    = null;
    this.selectors         = [];
    this.domIdPrefix       = existingSelectorId;
    this.product           = new InSales.Product(options['product']);

    this.onVariantSelected = InSales.isDefined(options.onVariantSelected) ? options.onVariantSelected : function(){};

    this.replaceSelector(existingSelectorId); // create the dropdowns

    this.selectAvailableVariant();
    this.selectVariantFromUrl();

    if (options['filterOptionValues']) this.filterOptionValues(); // Поочерёдная фильтрация значения св-в.

    return true;
};


InSales.SingleOptionSelector = function(multiSelector, index, option, values) {
    this.selectValue = function(value) {
        $(this.element).find('option[value="'+value+'"]').each(function(){
            $(this).attr("selected","selected")
        });
    };

    this.multiSelector = multiSelector;
    this.values = values;
    this.index = index;
    this.name = option['title'];
    this.option_id = option['id'];
    this.element = document.createElement('select');
    for (var i = 0; i < values.length; i++) {
        var opt = document.createElement('option');
        opt.value = values[i].id;
        opt.innerHTML = values[i].title;
        this.element.appendChild(opt);
    }
    this.element.setAttribute('class', this.multiSelector.selectorClass);
    this.element.id = multiSelector.domIdPrefix + '-option-' + index;
    this.element.onchange = function() {
        multiSelector.updateSelectors(index);
    };

    return true;
};

// Инициализировать добавление товара в корзину через Ajax.
function initAjaxAddToCartButton(handle, onAddToCart) {
    jQuery(handle).click(function(e){
        e.preventDefault();
        addOrderItem( jQuery(this).parents("form:first"), onAddToCart);
    });
}

// Добавление товара в корзину
function addOrderItem(form, onAddToCart) {
    var fields = form.serialize();
    var action = form.attr("action").split("?");
    var url    = action[0] + ".json";
    var lang   = action[1] ? "?"+action[1] : "";
    var path   = url + lang;
    show_preloader(); // Показываем прелоадер
    jQuery.ajax({
        url:      path,
        type:     'post',
        data:     fields,
        dataType: 'json',
        success:  onAddToCart,
        error:    hide_preloader
    });
}

// сабмит формы отзыва
jQuery(function($) {

    $("#feedback_commit").click(function(e){
        e.preventDefault();
        var form = $('#feedback_form');
        var fields = form.serialize();
        $.ajax({
            url:      form.attr('action') + '.json',
            type:     'post',
            data:     fields,
            dataType: 'json',
            beforeSend: function() {show_preloader();},
            complete: function() {hide_preloader();},
            success:  function(response) {
                if ( response.status == 'ok' ) {
                    $("textarea[name='feedback[content]']").val("");
                    var thanks = $("#thanks");
                    thanks.html(response.notice);
                    thanks.show();
                    window.setTimeout(function() {
                       thanks.fadeOut("slow", function(){thanks.hide();});
                    }, 6000);
                } else {
                    alert(errors_to_arr(response.errors).join("\n"));
                }
            }
        });
    });

})

// функция вытаскивает сообщения об ошибке из хэша в массив.
function errors_to_arr(errors){
    arr = [];
    $.each( errors, function(obj, msg){
        arr.push(msg);
    });
    return arr;
}


// Вывести индикатор работы (колесико)
function show_preloader() {
    var preloader = jQuery("#own_preloader");
    if ( !preloader.attr("id") ) {
        jQuery("body").append('<div id="own_preloader"><img src="/served_assets/loading.gif"/></div>');
        preloader = jQuery("#own_preloader");
    }
    preloader.show();

    changeCss(preloader);
    jQuery(window).bind("resize", function(){
        changeCss(preloader);
    });
    jQuery(window).bind("scroll", function(){
        changeCss(preloader);
    });
}

// Скрыть индикатор
function hide_preloader() {
    var preloader = jQuery("#own_preloader");
    if ( !preloader.attr("id") ) return;
    jQuery(window).unbind("resize");
    jQuery(window).unbind("scroll");
    preloader.remove();
}

// Заменить индикатор на сообщение
function set_preloaders_message(message) {
    var preloader = jQuery("#own_preloader");
    if ( !preloader.attr("id") ) return;
    preloader.html(message);
}

function changeCss(OBJ){
    var imageHeight  = OBJ.height();
    var imageWidth   = OBJ.width();
    var windowWidth  = jQuery(window).width();
    var windowHeight = jQuery(window).height();
    OBJ.css({
        "position" : "absolute",
        "left" : windowWidth / 2 - imageWidth / 2,
        "top" : getPageScroll()[1] + (getPageHeight() - imageHeight) / 2
    });
};

// getPageScroll() by quirksmode.com
function getPageScroll() {
    var xScroll, yScroll;
    if (self.pageYOffset) {
        yScroll = self.pageYOffset;
        xScroll = self.pageXOffset;
    } else if (document.documentElement && document.documentElement.scrollTop) {   // Explorer 6 Strict
        yScroll = document.documentElement.scrollTop;
        xScroll = document.documentElement.scrollLeft;
    } else if (document.body) {// all other Explorers
        yScroll = document.body.scrollTop;
        xScroll = document.body.scrollLeft;
    }
    return new Array(xScroll,yScroll)
}

// Adapted from getPageSize() by quirksmode.com
function getPageHeight() {
    var windowHeight
    if (self.innerHeight) {  // all except Explorer
        windowHeight = self.innerHeight;
    } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
        windowHeight = document.documentElement.clientHeight;
    } else if (document.body) { // other Explorers
        windowHeight = document.body.clientHeight;
    }
    return windowHeight
}

;
