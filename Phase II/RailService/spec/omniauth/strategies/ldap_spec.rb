require 'spec_helper'
describe "OmniAuth::Strategies::LDAP" do
  # :title => "My LDAP",
  # :host => '10.101.10.1',
  # :port => 389,
  # :method => :plain,
  # :base => 'dc=intridea, dc=com',
  # :uid => 'sAMAccountName',
  # :name_proc => Proc.new {|name| name.gsub(/@.*$/,'')}
  # :bind_dn => 'default_bind_dn'
  # :password => 'password'
  class PISlixLdapProvider < OmniAuth::Strategies::LDAP; end

  let(:app) do
    Rack::Builder.new {
      use OmniAuth::Test::PhonySession
      use PISlixVpn, :name => 'ldap', :title => 'PI Slix VPN', :host => 'localhost:3000', :base => 'dc=score, dc=local', :uid => 'pislixvpn', :name_proc => Proc.new {|name| name.gsub(/@.*$/,'')}
      run lambda { |env| [404, {'Content-Type' => 'text/plain'}, [env.key?('omniauth.auth').to_s]] }
    }.to_app
  end

  describe 'post /authentication/ldap/callback' do
    before(:each) do
      @adaptor = double(OmniAuth::LDAP::Adaptor, {:uid => "7fa1f8f6-498d-4054-9300-4fcd4fa6bb57" })
      @adaptor.stub(:filter)
      OmniAuth::LDAP::Adaptor.stub(:new).and_return(@adaptor)
    end

    context 'failure' do
      before(:each) do
        @adaptor.stub(:bind_as).and_return(false)
      end

      context "when username is not preset" do
        it 'should redirect to error page' do
          post('/authentication/ldap/callback', {})

          last_response.should_not be_redirect
          last_response.headers['Location'].should =~ %r{missing_credentials}
          last_response.body['token'].should_not be_present
        end
      end

      context "when username is empty" do
        it 'should redirect to error page' do
          post('/authentication/ldap/callback', {:username => ""})

          last_response.should be_redirect
          last_response.headers['Location'].should =~ %r{missing_credentials}
          last_response.body['token'].should_not be_present
        end
      end

      context "when username is present" do
        context "and password is not preset" do
          it 'should redirect to error page' do
            post('/authentication/ldap/callback', {:username => "ping"})

            last_response.should be_redirect
            last_response.headers['Location'].should =~ %r{missing_credentials}
            last_response.body['token'].should_not be_present
          end
        end

        context "and password is empty" do
          it 'should redirect to error page' do
            post('/authentication/ldap/callback', {:username => "ping", :password => ""})

            last_response.should be_redirect
            last_response.headers['Location'].should =~ %r{missing_credentials}
            last_response.body['token'].should_not be_present
          end
        end
      end

      context "when username and password are present" do
        context "and bind on LDAP server failed" do
          it 'should return error HTTP status and no API token' do
            post('/authentication/ldap/callback', {:username => 'admin@example.com', :password => 'password'})

            last_response.should be_redirect
            last_response.headers['Location'].should =~ %r{invalid_credentials}
          end
          context 'and filter is set' do
            it 'should bind with filter' do
              @adaptor.stub(:filter).and_return('uid=%{username}')
              Net::LDAP::Filter.should_receive(:construct).with('uid=ping')
              post('/authentication/ldap/callback', {:username => 'admin@example.com', :password => 'password'})

              last_response.should_not be_redirect
              last_response.headers['Location'].should =~ %r{invalid_credentials}
              last_response.body['token'].should_not be_present
            end
          end

        end

        context "and communication with LDAP server caused an exception" do
          before :each do
            @adaptor.stub(:bind_as).and_throw(Exception.new('connection_error'))
          end

          it 'should return error HTTP status and no API token' do
            post('/authentication/ldap/callback', {:username => 'admin@example.com', :password => 'nil'})

            last_response.should_not be_redirect
            last_response.headers['Location'].should =~ %r{ldap_error}
            last_response.body['token'].should_not be_present
          end
        end
      end
    end

    context 'success' do
      let(:auth_hash){ last_request.env['omniauth.auth'] }

      before(:each) do
        @adaptor.stub(:filter)
        @adaptor.stub(:bind_as).and_return(Net::LDAP::Entry.from_single_ldif_string(
      %Q{dn: cn=pislixvpn, dc=process-instruments, dc=com
mail: admin@example.com
givenname: Pi
sn: Slix
uid: 7fa1f8f6-498d-4054-9300-4fcd4fa6bb57 
}
    ))
      end

      it 'should not redirect to error page' do
        post('/authentication/ldap/callback', {:username => 'admin@example.com', :password => '!P1Scob70000'})
        last_response.should_not be_redirect
      end

      context 'and filter is set' do
        it 'should bind with filter' do
          @adaptor.stub(:filter).and_return('uid=%{username}')
          Net::LDAP::Filter.should_receive(:construct).with('uid=ping')
          post('/authentication/ldap/callback', {:username => 'admin@example.com', :password => '!P1Scob70000'})

          last_response.should_not be_redirect
        end
      end

      it 'should map user info to Auth Hash' do
        post('/authentication/ldap/callback', {:username => 'admin@example.com', :password => '!P1Scob70000'})
        auth_hash.uid.should == 'cn=ping, dc=intridea, dc=com'
        auth_hash.info.email.should == 'admin@example.com'
        auth_hash.info.first_name.should == 'Pi'
        auth_hash.info.last_name.should == 'Slix'
      end
    end
  end
end
