# TODOS:
#   Build out Authenticate#ldap to pass the 'GET ldap' test
#   Properly set-up 'POST create' test
#   Complete the 'DELETE destroy' test
require 'spec_helper'

describe AuthenticateController do

  # This should return the minimal set of attributes required to create a valid
  # Authenticate. As you add validations to Authenticate, be sure to
  # adjust the attributes here as well.
  let(:valid_attributes) { {  } }

  # This should return the minimal set of values that should be in the session
  # in order to pass any filters (e.g. authentication) defined in
  # AuthenticatesController. Be sure to keep this updated too.
  let(:valid_session) { {} }

  describe "GET ldap" do
    it "returns an a simple form containing :email and :password input fields" do
      authenticate = Authenticate.create! valid_attributes
      get :ldap, {}, valid_session
      assigns(:authenticates).should eq([authenticate])
    end
  end

  describe "POST create" do
    describe "with valid params" do
      it "creates a new Authenticate" do
        expect {
          post :create, {:authenticate => valid_attributes}, valid_session
        }.to change(Authenticate, :count).by(1)
      end

      it "assigns a newly created authenticate as @authenticate" do
        post :create, {:authenticate => valid_attributes}, valid_session
        assigns(:authenticate).should be_a(Authenticate)
        assigns(:authenticate).should be_persisted
      end

      it "redirects to the created authenticate" do
        post :create, {:authenticate => valid_attributes}, valid_session
        response.should redirect_to(Authenticate.last)
      end
    end

    describe "with invalid params" do
      it "assigns a newly created but unsaved authenticate as @authenticate" do
        # Trigger the behavior that occurs when invalid params are submitted
        Authenticate.any_instance.stub(:save).and_return(false)
        post :create, {:authenticate => {  }}, valid_session
        assigns(:authenticate).should be_a_new(Authenticate)
      end

      it "re-renders the 'new' template" do
        # Trigger the behavior that occurs when invalid params are submitted
        Authenticate.any_instance.stub(:save).and_return(false)
        post :create, {:authenticate => {  }}, valid_session
        response.should render_template("new")
      end
    end
  end

  describe "DELETE destroy" do
    it "destroys the requested authenticate" do
      authenticate = Authenticate.create! valid_attributes
      expect {
        delete :destroy, {:id => authenticate.to_param}, valid_session
      }.to change(Authenticate, :count).by(-1)
    end

    it "redirects to the authenticates list" do
      authenticate = Authenticate.create! valid_attributes
      delete :destroy, {:id => authenticate.to_param}, valid_session
      response.should redirect_to(authenticates_url)
    end
  end
end
