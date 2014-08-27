class Client < ActiveRecord::Base
  has_many :client_locations, dependent: :destroy
end
