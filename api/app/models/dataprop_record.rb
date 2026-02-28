class DatapropRecord < ActiveRecord::Base
  self.abstract_class = true
  establish_connection :"dataprop_#{Rails.env}"

  def readonly?
    true
  end
end
