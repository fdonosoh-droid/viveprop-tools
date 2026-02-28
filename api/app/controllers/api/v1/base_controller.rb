module Api
  module V1
    class BaseController < ActionController::API
      include AppKeyAuthentication
      include Authenticatable
      include AdminAuthorizable
    end
  end
end
