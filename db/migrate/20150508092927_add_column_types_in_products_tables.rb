class AddColumnTypesInProductsTables < ActiveRecord::Migration
  def change
    add_column :products, :types, :text
  end
end
