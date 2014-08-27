json.array!(@client_locations) do |client_location|
  json.extract! client_location, :id, :description, :client_id
  json.url client_location_url(client_location, format: :json)
end
