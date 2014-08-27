require 'rails_helper'

RSpec.describe Client, :type => :model do
  it { should respond_to(:name) }
end
