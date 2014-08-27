require 'spec_helper'

describe "client_locations/index" do
  before(:each) do
    assign(:client_locations, [
      stub_model(ClientLocation),
      stub_model(ClientLocation)
    ])
  end

  it "renders a list of client_locations" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
  end
end
