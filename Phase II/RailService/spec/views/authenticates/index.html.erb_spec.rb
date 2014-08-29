require 'spec_helper'

describe "authenticates/index" do
  before(:each) do
    assign(:authenticates, [
      stub_model(Authenticate),
      stub_model(Authenticate)
    ])
  end

  it "renders a list of authenticates" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
  end
end
