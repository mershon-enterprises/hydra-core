require "spec_helper"

describe ClientLocationsController do
  describe "routing" do

    it "routes to #index" do
      get("/client_locations").should route_to("client_locations#index")
    end

    it "routes to #new" do
      get("/client_locations/new").should route_to("client_locations#new")
    end

    it "routes to #show" do
      get("/client_locations/1").should route_to("client_locations#show", :id => "1")
    end

    it "routes to #edit" do
      get("/client_locations/1/edit").should route_to("client_locations#edit", :id => "1")
    end

    it "routes to #create" do
      post("/client_locations").should route_to("client_locations#create")
    end

    it "routes to #update" do
      put("/client_locations/1").should route_to("client_locations#update", :id => "1")
    end

    it "routes to #destroy" do
      delete("/client_locations/1").should route_to("client_locations#destroy", :id => "1")
    end

  end
end
