module Api
  module V1
    module Captacion
      class CorredoresController < BaseController
        # GET /api/v1/captacion/corredores
        def index
          viveprop_id = ENV.fetch('VIVEPROP_COMPANY_ID', '362').to_i
          corredores = Dataprop::User.viveprop_company(viveprop_id).ordered

          render json: {
            success: true,
            data: {
              total: corredores.count,
              corredores: corredores.map(&:as_corredor_json)
            }
          }
        end
      end
    end
  end
end
