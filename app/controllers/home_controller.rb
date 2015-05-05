class HomeController < ApplicationController
  include CurrentCart

  def index
  end
  
  def product1
  	@products = Product.all
  end

end
