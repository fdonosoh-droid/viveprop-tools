module Api
  module V1
    class AuthController < BaseController
      skip_before_action :verify_app_key, only: [:login]
      skip_before_action :authenticate_request, only: [:login]

      def login
        email = params[:email]
        password = params[:password]

        if email.blank? || password.blank?
          return render json: {
            error: 'BadRequest',
            message: 'Email y password son requeridos'
          }, status: :bad_request
        end

        user = Dataprop::User.find_by(email: email.downcase)

        password_valid = if user
                           user.valid_password?(password)
                         else
                           BCrypt::Password.new(BCrypt::Password.create('dummy')) == password
                           false
                         end

        unless password_valid
          return render json: {
            error: 'Unauthorized',
            message: 'Credenciales invalidas'
          }, status: :unauthorized
        end

        unless authorized_for_viveprop?(user)
          return render json: {
            error: 'Forbidden',
            message: 'Usuario no autorizado para ViveProp'
          }, status: :forbidden
        end

        token = generate_token(user)
        render json: {
          token: "Bearer #{token}",
          data: serialize_user(user)
        }, status: :ok
      end

      private

      def generate_token(user)
        payload = {
          user_id: user.id,
          email: user.email,
          iat: Time.current.to_i,
          exp: 24.hours.from_now.to_i
        }
        JWT.encode(payload, Rails.application.secret_key_base, 'HS512')
      end

      def viveprop_company_id
        @viveprop_company_id ||= ENV.fetch('VIVEPROP_COMPANY_ID', '362').to_i
      end

      def authorized_for_viveprop?(user)
        user.email.end_with?('@dataprop.cl') ||
          user.email == ENV.fetch('ADMIN_EMAIL', 'agencia@databrokers.cl') ||
          user.company_id == viveprop_company_id
      end

      def serialize_user(user)
        company = user.company_id ? Dataprop::Company.find_by(id: user.company_id) : nil
        permissions = ToolPermission.for_user(user.id)

        {
          id: user.id.to_s,
          type: 'user',
          attributes: {
            email: user.email,
            full_name: user.full_name,
            full_rut: user.full_rut,
            role: user.role,
            avatar_url: nil,
            company_name: company&.fantasy_name || company&.full_name
          },
          role_type: determine_role_type(user),
          tool_permissions: admin?(user) ? { evaluacion_comercial: true, perfilamiento: true } : permissions.permissions_hash,
          is_admin: admin?(user)
        }
      end

      def determine_role_type(user)
        user.company_id == viveprop_company_id ? 'gestor' : 'corredor'
      end
    end
  end
end
