require 'spec_helper'

describe "authenticates/edit" do
  before(:each) do
    @authenticate = assign(:authenticate, stub_model(Authenticate))
  end

  it "renders the edit authenticate form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", authenticate_path(@authenticate), "post" do
    end
  end
end
