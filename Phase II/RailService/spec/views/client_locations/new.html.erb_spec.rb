require 'spec_helper'

describe "client_locations/new" do
  before(:each) do
    assign(:client_location, stub_model(ClientLocation).as_new_record)
  end

  it "renders new client_location form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", client_locations_path, "post" do
    end
  end
end
