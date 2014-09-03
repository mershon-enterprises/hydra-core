class AuthenticateController < ApplicationController
  protect_from_forgery with: :exception
end
