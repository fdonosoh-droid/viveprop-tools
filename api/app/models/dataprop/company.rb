class Dataprop::Company < DatapropRecord
  self.table_name = 'companies'
  has_many :users, class_name: 'Dataprop::User', foreign_key: 'company_id'
end
