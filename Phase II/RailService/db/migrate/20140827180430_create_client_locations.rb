class CreateClientLocations < ActiveRecord::Migration
  def change
    create_table :client_locations do |t|
      t.string :description

      t.timestamps
    end
  end
end
