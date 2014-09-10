module ProcessInstrumentsPWT
  class API < Grape::API
    version '0.1.0', using: :path, vendor: 'process instruments'
    format :json

    helpers do
    end

    resource :access_levels do
    end

    resource :admin_authenticate do
    end

    resource :authenticate do
    end

    resource :clients do
    end

    resource :data do
    end

    resource :users do
    end

    resource :version do
    end
  end
end
