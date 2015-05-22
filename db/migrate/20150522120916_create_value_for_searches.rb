class CreateValueForSearches < ActiveRecord::Migration
  def change
    create_table :value_for_searches do |t|
      t.text :product
      t.text :title
      t.text :description
      t.text :keywords

      t.timestamps null: false
    end
  end
end
