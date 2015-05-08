class ProductsController < ApplicationController
  before_action :set_product, only: [:show, :edit, :update, :destroy]
  include CurrentCart
  include Acses_denied

  def title
    @active_link_title = true
  end

  def shipping
    @active_link_shipping = true
  end

  def news
    @active_link_news = true
  end

  def contacts
    @active_link_contacts = true
  end

  def avtoklavs
    @products = Product.where(types: 'avtoklavs')
  end

  # GET /products
  # GET /products.json
  def index
    @products = Product.all
    acses_denied_for_action_index
  end

  # GET /products/1
  # GET /products/1.json
  def show
    acses_denied_for_action_show
  end

  # GET /products/new
  def new
    @product = Product.new
  end

  # GET /products/1/edit
  def edit
    acses_denied_for_action_edit
  end

  # POST /products
  # POST /products.json
  def create
    @product = Product.new(product_params)

    respond_to do |format|
      if @product.save
        format.html { redirect_to @product, notice: 'Product was successfully created.' }
        format.json { render :show, status: :created, location: @product }
      else
        format.html { render :new }
        format.json { render json: @product.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /products/1
  # PATCH/PUT /products/1.json
  def update
    respond_to do |format|
      if @product.update(product_params)
        format.html { redirect_to @product, notice: 'Product was successfully updated.' }
        format.json { render :show, status: :ok, location: @product }
      else
        format.html { render :edit }
        format.json { render json: @product.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /products/1
  # DELETE /products/1.json
  def destroy
    @product.destroy
    respond_to do |format|
      format.html { redirect_to products_url, notice: 'Product was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_product
      @product = Product.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def product_params
      params.require(:product).permit(:title, :description, :price, :image, :types)
    end
end
