class Product < ActiveRecord::Base
	has_many :line_items
	before_destroy :ensure_not_referenced_by_any_line_item




	def self.get_massive_title_product
		products = Product.all
		massive_products_for_title_page = []
		products.each do |product|
			massive_products_for_title_page << product.types
		end
		return massive_products_for_title_page.uniq
	end










	private

	def ensure_not_referenced_by_any_line_item
		if line_items.empty?
			return true
		else
			errors.add(:base, 'существуют товарные позиции')
			return false
		end
	end
end
