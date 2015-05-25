class ValueForSearchesController < ApplicationController
  before_action :set_value_for_search, only: [:show, :edit, :update, :destroy]

  # GET /value_for_searches
  # GET /value_for_searches.json
  def index
    ValueForSearch.create_value_for_search
    @value_for_searches = ValueForSearch.all

  end

  # GET /value_for_searches/1
  # GET /value_for_searches/1.json
  def show
  end

  # GET /value_for_searches/new
  def new
    @value_for_search = ValueForSearch.new
  end

  # GET /value_for_searches/1/edit
  def edit
  end

  # POST /value_for_searches
  # POST /value_for_searches.json
  def create
    @value_for_search = ValueForSearch.new(value_for_search_params)

    respond_to do |format|
      if @value_for_search.save
        format.html { redirect_to @value_for_search, notice: 'Value for search was successfully created.' }
        format.json { render :show, status: :created, location: @value_for_search }
      else
        format.html { render :new }
        format.json { render json: @value_for_search.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /value_for_searches/1
  # PATCH/PUT /value_for_searches/1.json
  def update
    respond_to do |format|
      if @value_for_search.update(value_for_search_params)
        format.html { redirect_to @value_for_search, notice: 'Value for search was successfully updated.' }
        format.json { render :show, status: :ok, location: @value_for_search }
      else
        format.html { render :edit }
        format.json { render json: @value_for_search.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /value_for_searches/1
  # DELETE /value_for_searches/1.json
  def destroy
    @value_for_search.destroy
    respond_to do |format|
      format.html { redirect_to value_for_searches_url, notice: 'Value for search was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_value_for_search
      @value_for_search = ValueForSearch.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def value_for_search_params
      params.require(:value_for_search).permit(:product, :title, :description, :keywords)
    end
end
