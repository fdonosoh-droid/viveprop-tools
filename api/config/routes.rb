Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      post 'auth/login', to: 'auth#login'

      namespace :admin do
        resources :tool_permissions, only: [:index, :update], param: :user_id
      end

      namespace :captacion do
        resources :corredores, only: [:index]
      end
    end
  end
end
