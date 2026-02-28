module AdminAuthorizable
  extend ActiveSupport::Concern

  private

  def require_admin!
    admin_email = ENV.fetch('ADMIN_EMAIL', 'agencia@databrokers.cl')
    unless current_user&.email == admin_email
      render json: { error: 'Forbidden', message: 'Acceso restringido a administradores' }, status: :forbidden
    end
  end

  def admin?(user)
    admin_email = ENV.fetch('ADMIN_EMAIL', 'agencia@databrokers.cl')
    user&.email == admin_email
  end
end
