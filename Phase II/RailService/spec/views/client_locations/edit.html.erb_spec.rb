require 'spec_helper'

describe "client_locations/edit" do
  before(:each) do
    @client_location = assign(:client_location, stub_model(ClientLocation))
  end

  it "renders the edit client_location form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", client_location_path(@client_location), "post" do
    end
  end
end
