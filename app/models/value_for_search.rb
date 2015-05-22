class ValueForSearch < ActiveRecord::Base

  def self.create_value_for_search
    Product.get_massive_title_product.each do |product_types|
        if ValueForSearch.where(product: product_types).empty?
          ValueForSearch.create(product: product_types)
        end
    end
  end

end
