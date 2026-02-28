class ToolPermission < ApplicationRecord
  self.table_name = 'core_tool_permissions'

  validates :dataprop_user_id, presence: true, uniqueness: true

  def self.for_user(dataprop_user_id)
    find_or_initialize_by(dataprop_user_id: dataprop_user_id)
  end

  def permissions_hash
    {
      evaluacion_comercial: can_evaluacion_comercial,
      perfilamiento: can_perfilamiento
    }
  end
end
