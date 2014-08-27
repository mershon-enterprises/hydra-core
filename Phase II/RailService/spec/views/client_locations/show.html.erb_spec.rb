require 'spec_helper'

describe "client_locations/show" do
  before(:each) do
    @client_location = assign(:client_location, stub_model(ClientLocation))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
  end
end
