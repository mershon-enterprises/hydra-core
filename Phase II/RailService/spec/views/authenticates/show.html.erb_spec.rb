require 'spec_helper'

describe "authenticates/show" do
  before(:each) do
    @authenticate = assign(:authenticate, stub_model(Authenticate))
  end

  it "renders attributes in <p>" do
    render
    # Run the generator again with the --webrat flag if you want to use webrat matchers
  end
end
