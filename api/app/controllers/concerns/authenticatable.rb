module Authenticatable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_request
  end

  private

  def authenticate_request
    token = request.headers['Authorization']&.split(' ')&.last

    if token.blank?
      render json: { error: 'Unauthorized', message: 'Token de autorizacion requerido' }, status: :unauthorized
      return
    end

    begin
      decoded = JWT.decode(token, Rails.application.secret_key_base, true, { algorithms: ['HS512'] })
      @current_user_id = decoded[0]['user_id']
    rescue JWT::ExpiredSignature
      render json: { error: 'Unauthorized', message: 'Token expirado' }, status: :unauthorized
    rescue JWT::DecodeError
      render json: { error: 'Unauthorized', message: 'Token invalido' }, status: :unauthorized
    end
  end

  def current_user
    @current_user ||= Dataprop::User.find_by(id: @current_user_id)
  end

  def current_user_id
    @current_user_id
  end
end
