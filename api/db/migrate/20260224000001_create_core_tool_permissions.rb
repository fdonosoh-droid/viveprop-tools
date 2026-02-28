class CreateCoreToolPermissions < ActiveRecord::Migration[8.0]
  def change
    create_table :core_tool_permissions do |t|
      t.bigint :dataprop_user_id, null: false
      t.boolean :can_evaluacion_comercial, default: false, null: false
      t.boolean :can_perfilamiento, default: false, null: false
      t.timestamps
    end

    add_index :core_tool_permissions, :dataprop_user_id, unique: true
  end
end
