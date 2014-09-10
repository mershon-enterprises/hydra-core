require File.expand_path('../boot', __FILE__)

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

if defined?(Bundler)
  # If you precompile assets before deploying to production, use this line
  Bundler.require(*Rails.groups(:assets => %w(development test)))
  # If you want your assets lazily compiled in production, use this line
  ## Bundler.require(:default, :assets, Rails.env)
end

module Railservice
  class Application < Rails::Application

    config.time_zone = 'Pacific Time (US & Canada)'
    config.generators do |g|
      g.factory_girl true
    end

    # Enable the asset pipeline
    config.assets.enabled = true 
    # Storing API directory string in local variable 
    # to keep with style conventions
    api_dir = 'processinstrumentspwt'
    config.paths.add File.join('app','api'), 
      glob: File.join(api_dir, '*.rb')
    config.autoload_paths += Dir[Rails.root.join('app','api',api_dir)]
  end
end
