module ValueForSearchesHelper

  def default_title
    'Купить автоклав в Минске, Беларуси, интрнет магазин Intertron'
  end

  def default_description
    'Купить автоклав в Минске, Беларуси, интрнет магазин Intertron'
  end

  def default_keywords
    'купить автоклав в Минске, автоклав, приспособление для консервирование, автоматическое консервирование, консервирование овощей, консервирование тушенки, автоклав в минске, дача, консервы, закатываем урожай, автоклав бытовой, дачные заготовки, зимние заготовки, домашний автоклав, автоклав для домашнего консервирования, автоклав своими руками, стерилизатор паровой, тушенка в автоклаве, овощи в атоклаве, варенье в автоклаве, грибы в автоклаве, автоклав видео, тушенка домашняя, как сделать тушенку, автоклавы домашние, автоклав газовый, автоклав электрический, автоклав инструкция, рецепты для автоклава, рыбные консервы в автоклаве, автоклав бу, автоклав б/у, Беларусь, купить, предложение, цена'
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
