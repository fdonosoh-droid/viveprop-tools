class Dataprop::User < DatapropRecord
  self.table_name = 'users'

  belongs_to :company, class_name: 'Dataprop::Company', optional: true

  scope :viveprop_company, ->(id) { where(company_id: id) }
  scope :active, -> { where.not(confirmed_at: nil) }
  scope :ordered, -> { order(:full_name) }

  def valid_password?(password)
    return false if encrypted_password.blank?
    BCrypt::Password.new(encrypted_password) == password
  end

  def formatted_phone
    cellphone&.gsub(/\s+/, '')
  end

  def as_corredor_json
    {
      id: id,
      email: email,
      full_name: full_name,
      cellphone: formatted_phone,
      created_at: created_at
    }
  end
end
