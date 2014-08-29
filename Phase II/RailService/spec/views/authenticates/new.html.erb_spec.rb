require 'spec_helper'

describe "authenticates/new" do
  before(:each) do
    assign(:authenticate, stub_model(Authenticate).as_new_record)
  end

  it "renders new authenticate form" do
    render

    # Run the generator again with the --webrat flag if you want to use webrat matchers
    assert_select "form[action=?][method=?]", authenticates_path, "post" do
    end
  end
end
