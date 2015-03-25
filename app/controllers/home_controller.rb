class HomeController < ApplicationController
  include CurrentCart

  def title
  end
  
  def product1
  	@products = Product.all
  end

end
