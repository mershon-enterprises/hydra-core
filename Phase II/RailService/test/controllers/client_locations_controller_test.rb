require 'test_helper'

class ClientLocationsControllerTest < ActionController::TestCase
  setup do
    @client_location = client_locations(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:client_locations)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create client_location" do
    assert_difference('ClientLocation.count') do
      post :create, client_location: { client_id: @client_location.client_id, description: @client_location.description }
    end

    assert_redirected_to client_location_path(assigns(:client_location))
  end

  test "should show client_location" do
    get :show, id: @client_location
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @client_location
    assert_response :success
  end

  test "should update client_location" do
    patch :update, id: @client_location, client_location: { client_id: @client_location.client_id, description: @client_location.description }
    assert_redirected_to client_location_path(assigns(:client_location))
  end

  test "should destroy client_location" do
    assert_difference('ClientLocation.count', -1) do
      delete :destroy, id: @client_location
    end

    assert_redirected_to client_locations_path
  end
end
