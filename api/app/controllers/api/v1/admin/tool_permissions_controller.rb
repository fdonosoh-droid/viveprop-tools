module Api
  module V1
    module Admin
      class ToolPermissionsController < BaseController
        before_action :require_admin!

        # GET /api/v1/admin/tool_permissions
        def index
          viveprop_id = ENV.fetch('VIVEPROP_COMPANY_ID', '362').to_i
          users = Dataprop::User.viveprop_company(viveprop_id).ordered

          permissions_map = ToolPermission.where(dataprop_user_id: users.pluck(:id))
                                          .index_by(&:dataprop_user_id)

          data = users.map do |user|
            perm = permissions_map[user.id]
            {
              id: user.id,
              email: user.email,
              full_name: user.full_name,
              cellphone: user.formatted_phone,
              can_evaluacion_comercial: perm&.can_evaluacion_comercial || false,
              can_perfilamiento: perm&.can_perfilamiento || false
            }
          end

          render json: { success: true, data: data }
        end

        # PATCH /api/v1/admin/tool_permissions/:user_id
        def update
          permission = ToolPermission.for_user(params[:user_id])

          if permission.update(permission_params)
            render json: {
              success: true,
              data: {
                dataprop_user_id: permission.dataprop_user_id,
                can_evaluacion_comercial: permission.can_evaluacion_comercial,
                can_perfilamiento: permission.can_perfilamiento
              }
            }
          else
            render json: { success: false, errors: permission.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def permission_params
          params.permit(:can_evaluacion_comercial, :can_perfilamiento)
        end
      end
    end
  end
end
