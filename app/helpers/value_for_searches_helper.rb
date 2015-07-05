module ValueForSearchesHelper

  def default_title
    'Интрнет магазин Intertron, продажа товаров для дома и дачи, охоты и рыбалки'
  end

  def default_description
    'Купить автоклав в Минске, Беларуси, интрнет магазин Intertron, продажа надувных лодок в Минске, надувные лодки'
  end

  def default_keywords
    'Купить автоклав в Минске, Автоклав, тушенка, автоклав в Минске, автоклав стерилизатор, стерилизация консервов, скороварка автоклав, Купить автоклав в Минске, автоклав в Беларуси, купить автоклав новый, тушенка, консерва, мясо, овощи в автоклаве, надувные лодки, купить надувные лодки, лодки под мотор, рыболовные плавсредства'
  end

  def set_title_for_search
    if params[:types]
      ValueForSearch.where(product: params[:types]).first.title
    else
      default_title
    end
  end

  def set_description_for_search
    if params[:types]
      ValueForSearch.where(product: params[:types]).first.description
    else
      default_description
    end
  end

  def set_keywords_for_search
    if params[:types]
      ValueForSearch.where(product: params[:types]).first.keywords
    else
      default_keywords
    end
  end

end
