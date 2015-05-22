require 'test_helper'

class ValueForSearchesControllerTest < ActionController::TestCase
  setup do
    @value_for_search = value_for_searches(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:value_for_searches)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create value_for_search" do
    assert_difference('ValueForSearch.count') do
      post :create, value_for_search: { description: @value_for_search.description, keywords: @value_for_search.keywords, product: @value_for_search.product, title: @value_for_search.title }
    end

    assert_redirected_to value_for_search_path(assigns(:value_for_search))
  end

  test "should show value_for_search" do
    get :show, id: @value_for_search
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @value_for_search
    assert_response :success
  end

  test "should update value_for_search" do
    patch :update, id: @value_for_search, value_for_search: { description: @value_for_search.description, keywords: @value_for_search.keywords, product: @value_for_search.product, title: @value_for_search.title }
    assert_redirected_to value_for_search_path(assigns(:value_for_search))
  end

  test "should destroy value_for_search" do
    assert_difference('ValueForSearch.count', -1) do
      delete :destroy, id: @value_for_search
    end

    assert_redirected_to value_for_searches_path
  end
end
