require "spec_helper"

describe AuthenticatesController do
  describe "routing" do

    it "routes to #index" do
      get("/authenticates").should route_to("authenticates#index")
    end

    it "routes to #new" do
      get("/authenticates/new").should route_to("authenticates#new")
    end

    it "routes to #show" do
      get("/authenticates/1").should route_to("authenticates#show", :id => "1")
    end

    it "routes to #edit" do
      get("/authenticates/1/edit").should route_to("authenticates#edit", :id => "1")
    end

    it "routes to #create" do
      post("/authenticates").should route_to("authenticates#create")
    end

    it "routes to #update" do
      put("/authenticates/1").should route_to("authenticates#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/authenticates/1").should route_to("authenticates#destroy", :id => "1")
    end

  end
end
