module AppKeyAuthentication
  extend ActiveSupport::Concern

  included do
    before_action :verify_app_key
  end

  private

  def verify_app_key
    provided_key = request.headers['X-App-Key']
    expected_key = ENV['X_APP_KEY']

    return if expected_key.blank?

    if provided_key.blank?
      render json: { error: 'Unauthorized', message: 'Missing X-App-Key header' }, status: :unauthorized
      return
    end

    unless ActiveSupport::SecurityUtils.secure_compare(provided_key, expected_key)
      render json: { error: 'Forbidden', message: 'Invalid X-App-Key' }, status: :forbidden
    end
  end
end
