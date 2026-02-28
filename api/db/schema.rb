# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_02_24_000001) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "core_broker_groups", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", limit: 100, null: false
    t.text "notes"
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_core_broker_groups_on_name", unique: true
  end

  create_table "core_broker_profiles", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "dataprop_user_id", null: false
    t.bigint "group_id"
    t.text "market_types", default: [], null: false, array: true
    t.text "property_types", default: [], array: true
    t.string "residence_commune_code", limit: 5
    t.datetime "updated_at", null: false
    t.index ["dataprop_user_id"], name: "index_core_broker_profiles_on_dataprop_user_id", unique: true
    t.index ["group_id"], name: "index_core_broker_profiles_on_group_id"
    t.index ["market_types"], name: "index_core_broker_profiles_on_market_types", using: :gin
    t.index ["property_types"], name: "index_core_broker_profiles_on_property_types", using: :gin
    t.index ["residence_commune_code"], name: "index_core_broker_profiles_on_residence_commune_code"
  end

  create_table "core_broker_work_communes", force: :cascade do |t|
    t.string "commune_code", limit: 5, null: false
    t.bigint "core_broker_profile_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["core_broker_profile_id", "commune_code"], name: "idx_broker_work_communes_uniq", unique: true
    t.index ["core_broker_profile_id"], name: "index_core_broker_work_communes_on_core_broker_profile_id"
  end

  create_table "core_lead_properties", force: :cascade do |t|
    t.bigint "core_lead_id", null: false
    t.datetime "created_at", null: false
    t.integer "insistences_count", default: 0
    t.text "notes"
    t.bigint "stock_propiedad_id", null: false
    t.datetime "updated_at", null: false
    t.index ["core_lead_id", "stock_propiedad_id"], name: "idx_lead_properties_unique", unique: true
    t.index ["stock_propiedad_id"], name: "index_core_lead_properties_on_stock_propiedad_id"
  end

  create_table "core_leads", force: :cascade do |t|
    t.datetime "assigned_at"
    t.bigint "assigned_broker_profile_id"
    t.bigint "assigned_by_user_id"
    t.string "cellphone", limit: 20
    t.text "comment"
    t.text "communes_of_interest", default: [], array: true
    t.datetime "created_at", null: false
    t.bigint "dataprop_lead_id"
    t.string "email", limit: 255
    t.string "first_name", limit: 100
    t.string "intention", limit: 20
    t.jsonb "json_payload", default: {}
    t.string "last_name", limit: 100
    t.decimal "max_price", precision: 12, scale: 2
    t.decimal "min_price", precision: 12, scale: 2
    t.decimal "monthly_income", precision: 12, scale: 2
    t.string "origin", limit: 50, default: "manual", null: false
    t.text "property_types", default: [], array: true
    t.datetime "received_at"
    t.string "saas_status", limit: 50, default: "lead"
    t.text "typologies", default: [], array: true
    t.datetime "unassigned_at"
    t.bigint "unassigned_by_user_id"
    t.string "unassigned_reason"
    t.datetime "updated_at", null: false
    t.string "viveprop_status", limit: 20, default: "new", null: false
    t.index ["assigned_broker_profile_id"], name: "index_core_leads_on_assigned_broker_profile_id"
    t.index ["cellphone"], name: "index_core_leads_on_cellphone"
    t.index ["communes_of_interest"], name: "index_core_leads_on_communes_of_interest", using: :gin
    t.index ["dataprop_lead_id"], name: "index_core_leads_on_dataprop_lead_id", unique: true, where: "(dataprop_lead_id IS NOT NULL)"
    t.index ["email"], name: "index_core_leads_on_email"
    t.index ["intention"], name: "index_core_leads_on_intention"
    t.index ["origin"], name: "index_core_leads_on_origin"
    t.index ["property_types"], name: "index_core_leads_on_property_types", using: :gin
    t.index ["saas_status"], name: "index_core_leads_on_saas_status"
    t.index ["unassigned_by_user_id"], name: "index_core_leads_on_unassigned_by_user_id", where: "(unassigned_by_user_id IS NOT NULL)"
    t.index ["viveprop_status"], name: "index_core_leads_on_viveprop_status"
  end

  create_table "core_negocio_eventos", force: :cascade do |t|
    t.datetime "completed_at"
    t.bigint "core_negocio_id", null: false
    t.datetime "created_at", null: false
    t.bigint "created_by_user_id", null: false
    t.text "descripcion"
    t.datetime "scheduled_at"
    t.string "tipo", limit: 30, null: false
    t.index ["completed_at"], name: "index_core_negocio_eventos_on_completed_at"
    t.index ["core_negocio_id", "scheduled_at"], name: "idx_negocio_eventos_by_schedule"
    t.index ["core_negocio_id"], name: "index_core_negocio_eventos_on_core_negocio_id"
    t.index ["created_by_user_id"], name: "index_core_negocio_eventos_on_created_by_user_id"
    t.index ["scheduled_at"], name: "index_core_negocio_eventos_on_scheduled_at"
    t.index ["tipo"], name: "index_core_negocio_eventos_on_tipo"
  end

  create_table "core_negocio_tareas", force: :cascade do |t|
    t.datetime "completed_at", precision: nil, default: -> { "now()" }, null: false
    t.bigint "completed_by_user_id", null: false
    t.bigint "core_negocio_id", null: false
    t.text "notes"
    t.string "tarea_key", limit: 30, null: false
    t.index ["core_negocio_id"], name: "idx_negocio_tareas_negocio"
    t.index ["tarea_key"], name: "idx_negocio_tareas_key"
    t.unique_constraint ["core_negocio_id", "tarea_key"], name: "core_negocio_tareas_core_negocio_id_tarea_key_key"
  end

  create_table "core_negocios", force: :cascade do |t|
    t.bigint "broker_profile_id", null: false
    t.datetime "closed_at"
    t.bigint "closed_by_user_id"
    t.bigint "core_lead_id", null: false
    t.datetime "created_at", null: false
    t.bigint "created_by_user_id", null: false
    t.string "etapa", limit: 20, default: "captacion", null: false
    t.integer "progreso", default: 0, null: false
    t.bigint "stock_propiedad_id", null: false
    t.datetime "updated_at", null: false
    t.index ["broker_profile_id"], name: "index_core_negocios_on_broker_profile_id"
    t.index ["core_lead_id", "stock_propiedad_id"], name: "idx_negocios_lead_propiedad_unique", unique: true
    t.index ["created_by_user_id"], name: "index_core_negocios_on_created_by_user_id"
    t.index ["etapa"], name: "index_core_negocios_on_etapa"
    t.index ["stock_propiedad_id"], name: "index_core_negocios_on_stock_propiedad_id"
  end

  create_table "core_property_assignments", force: :cascade do |t|
    t.datetime "assigned_at", null: false
    t.bigint "assigned_by_user_id", null: false
    t.bigint "core_broker_profile_id", null: false
    t.datetime "created_at", null: false
    t.text "notes"
    t.bigint "stock_propiedad_id", null: false
    t.datetime "unassigned_at"
    t.bigint "unassigned_by_user_id"
    t.string "unassignment_reason", limit: 50
    t.datetime "updated_at", null: false
    t.index ["assigned_at"], name: "index_core_property_assignments_on_assigned_at"
    t.index ["core_broker_profile_id"], name: "index_core_property_assignments_on_core_broker_profile_id"
    t.index ["stock_propiedad_id", "unassigned_at"], name: "idx_property_assignments_by_property_status"
    t.index ["stock_propiedad_id"], name: "idx_property_assignments_active_unique", unique: true, where: "(unassigned_at IS NULL)"
    t.index ["stock_propiedad_id"], name: "index_core_property_assignments_on_stock_propiedad_id"
    t.index ["unassigned_at"], name: "index_core_property_assignments_on_unassigned_at"
  end

  create_table "core_real_states", force: :cascade do |t|
    t.boolean "active", default: true
    t.string "address_apt", limit: 50
    t.string "address_number", limit: 20
    t.string "address_street"
    t.string "cod_comuna", limit: 5
    t.text "contact_emails", default: [], array: true
    t.string "contact_name"
    t.text "contact_phones", default: [], array: true
    t.string "country", limit: 2, default: "CL"
    t.string "country_id", limit: 20
    t.datetime "created_at", null: false
    t.string "market", null: false
    t.string "name", null: false
    t.text "notes"
    t.string "source_key", limit: 50
    t.datetime "updated_at", null: false
    t.text "urls", default: [], array: true
    t.uuid "uuid", default: -> { "gen_random_uuid()" }, null: false
    t.index ["active"], name: "index_core_real_states_on_active"
    t.index ["cod_comuna"], name: "index_core_real_states_on_cod_comuna"
    t.index ["country_id"], name: "index_core_real_states_on_country_id"
    t.index ["market"], name: "index_core_real_states_on_market"
    t.index ["source_key"], name: "index_core_real_states_on_source_key", unique: true, where: "(source_key IS NOT NULL)"
    t.index ["uuid"], name: "index_core_real_states_on_uuid", unique: true
  end

  create_table "core_tool_permissions", force: :cascade do |t|
    t.boolean "can_evaluacion_comercial", default: false, null: false
    t.boolean "can_perfilamiento", default: false, null: false
    t.datetime "created_at", null: false
    t.bigint "dataprop_user_id", null: false
    t.datetime "updated_at", null: false
    t.index ["dataprop_user_id"], name: "index_core_tool_permissions_on_dataprop_user_id", unique: true
  end

  create_table "dom_comunas", primary_key: "cod_comuna", id: { type: :string, limit: 5 }, force: :cascade do |t|
    t.jsonb "aliases", default: []
    t.string "cod_provincia", limit: 3, null: false
    t.datetime "created_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.string "nombre", limit: 100, null: false
    t.string "slug", limit: 100
    t.index ["cod_provincia"], name: "idx_dom_comunas_provincia"
    t.index ["nombre"], name: "idx_dom_comunas_nombre"
    t.index ["slug"], name: "idx_dom_comunas_slug"
  end

  create_table "dom_provincias", primary_key: "cod_provincia", id: { type: :string, limit: 3 }, force: :cascade do |t|
    t.jsonb "aliases", default: []
    t.string "cod_region", limit: 2, null: false
    t.datetime "created_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.string "nombre", limit: 100, null: false
    t.index ["cod_region"], name: "idx_dom_provincias_region"
  end

  create_table "dom_regiones", primary_key: "cod_region", id: { type: :string, limit: 2 }, force: :cascade do |t|
    t.jsonb "aliases", default: []
    t.datetime "created_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.string "nombre", limit: 100, null: false
    t.string "numero_romano", limit: 5
  end

  create_table "ext_assetplan", id: :serial, comment: "Datos crudos de propiedades desde AssetPlan API", force: :cascade do |t|
    t.integer "anio_construccion"
    t.integer "arriendo"
    t.integer "banios"
    t.integer "bodegas", default: 0
    t.string "ciudad", limit: 100
    t.string "condominio", limit: 255
    t.integer "condominio_id"
    t.datetime "created_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.text "descripcion"
    t.string "direccion", limit: 255
    t.integer "dormitorios"
    t.integer "estacionamientos", default: 0
    t.string "fecha_disponible_venta", limit: 50
    t.boolean "for_sale", default: true
    t.jsonb "fotos"
    t.jsonb "fotos_originales"
    t.integer "ggcc"
    t.jsonb "hijos"
    t.string "inmobiliaria", limit: 255
    t.decimal "m2_terraza", precision: 10, scale: 2
    t.decimal "m2_uf", precision: 10, scale: 2
    t.decimal "m2_utiles", precision: 10, scale: 2
    t.decimal "monto_estimado", precision: 12, scale: 2
    t.string "nombre", limit: 100
    t.string "orientacion", limit: 50
    t.integer "piso"
    t.jsonb "raw_data", comment: "JSON completo de la respuesta original"
    t.decimal "retorno", precision: 5, scale: 2
    t.integer "source_id", null: false, comment: "ID original en AssetPlan"
    t.decimal "superficie", precision: 10, scale: 2
    t.string "sync_batch", limit: 50, comment: "Identificador del batch de sincronización"
    t.datetime "synced_at", precision: nil
    t.string "tipo", limit: 100
    t.string "tipologia", limit: 50
    t.string "unidad", limit: 50
    t.jsonb "unitggcc"
    t.datetime "updated_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.string "url_video", limit: 500
    t.decimal "valor_uf", precision: 12, scale: 2
    t.index ["ciudad"], name: "idx_ext_assetplan_ciudad"
    t.index ["condominio_id"], name: "idx_ext_assetplan_condominio_id"
    t.index ["for_sale"], name: "idx_ext_assetplan_for_sale"
    t.index ["source_id"], name: "idx_ext_assetplan_source_id"
    t.index ["sync_batch"], name: "idx_ext_assetplan_sync_batch"
    t.index ["tipologia"], name: "idx_ext_assetplan_tipologia"
    t.unique_constraint ["source_id"], name: "ext_assetplan_source_id_key"
  end

  create_table "ext_assetplan_condominios", id: :serial, force: :cascade do |t|
    t.string "cod_comuna", limit: 5
    t.datetime "created_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.string "direccion", limit: 255
    t.string "nombre", limit: 255, null: false
    t.datetime "synced_at", precision: nil
    t.jsonb "tipologias", default: []
    t.integer "total_propiedades", default: 0
    t.datetime "updated_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.index ["cod_comuna"], name: "idx_ext_assetplan_cond_comuna"
    t.index ["nombre"], name: "idx_ext_assetplan_cond_nombre"
    t.unique_constraint ["nombre", "direccion", "cod_comuna"], name: "ext_assetplan_condominios_nombre_direccion_cod_comuna_key"
  end

  create_table "ext_ingevec", id: :serial, force: :cascade do |t|
    t.integer "banos"
    t.string "codigo", limit: 100
    t.datetime "created_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.decimal "descuento_ejec", precision: 5, scale: 2
    t.decimal "descuento_gerente", precision: 5, scale: 2
    t.decimal "descuento_jefe", precision: 5, scale: 2
    t.integer "dormitorios"
    t.string "estado", limit: 50
    t.integer "linea"
    t.string "modelo", limit: 50
    t.string "nombre", limit: 100
    t.string "numero", limit: 20
    t.string "orientacion", limit: 50
    t.integer "piso"
    t.decimal "precio_base", precision: 12, scale: 2
    t.decimal "precio_esperado", precision: 12, scale: 2
    t.decimal "precio_lista", precision: 12, scale: 2
    t.string "programa", limit: 50
    t.integer "proyecto_source_id"
    t.jsonb "raw_data"
    t.integer "source_id", null: false
    t.decimal "sup_comercial", precision: 10, scale: 2
    t.decimal "sup_interior", precision: 10, scale: 2
    t.decimal "sup_municipal", precision: 10, scale: 2
    t.decimal "sup_ponderada", precision: 10, scale: 2
    t.decimal "sup_terraza", precision: 10, scale: 2
    t.string "sync_batch", limit: 50
    t.datetime "synced_at", precision: nil
    t.string "tipo_unidad", limit: 50
    t.datetime "updated_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.index ["estado"], name: "idx_ext_ingevec_estado"
    t.index ["proyecto_source_id"], name: "idx_ext_ingevec_proyecto"
    t.index ["source_id"], name: "idx_ext_ingevec_source"
    t.index ["tipo_unidad"], name: "idx_ext_ingevec_tipo"
    t.unique_constraint ["source_id"], name: "ext_ingevec_source_id_key"
  end

  create_table "ext_ingevec_proyectos", id: :serial, force: :cascade do |t|
    t.integer "ciudad_id"
    t.integer "comuna_id"
    t.string "comuna_nombre", limit: 100
    t.datetime "created_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.string "direccion", limit: 200
    t.integer "empresa_id"
    t.string "etapa", limit: 100
    t.string "nombre", limit: 50, null: false
    t.jsonb "raw_data"
    t.integer "region_id"
    t.integer "source_id", null: false
    t.string "sync_batch", limit: 50
    t.datetime "synced_at", precision: nil
    t.jsonb "tipologias"
    t.datetime "updated_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.index ["nombre"], name: "idx_ext_ingevec_proy_nombre"
    t.index ["source_id"], name: "idx_ext_ingevec_proy_source"
    t.unique_constraint ["source_id"], name: "ext_ingevec_proyectos_source_id_key"
  end

  create_table "ext_mobysuite", id: :serial, comment: "Datos crudos de bienes desde Mobysuite API (Urmeneta)", force: :cascade do |t|
    t.boolean "compartido_grupo"
    t.string "conjuntos", limit: 255
    t.datetime "created_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.text "descripcion_bien"
    t.decimal "descuento_autorizado", precision: 14, scale: 10
    t.decimal "descuento_no_autorizado", precision: 14, scale: 10
    t.decimal "descuento_sala", precision: 14, scale: 10
    t.boolean "disponible"
    t.integer "estado_bien", comment: "Código: 1=Disponible, 3=Reservado/Bloqueado"
    t.bigint "fecha_imagen"
    t.string "medio_informacion_cliente", limit: 100
    t.integer "num_banos"
    t.string "num_bien", limit: 50
    t.integer "num_dormitorios"
    t.text "observaciones"
    t.integer "orientacion", comment: "Código: 1=N, 2=S, 3=Oriente, 4=Poniente, 5=NE, 6=NO, 7=SE, 8=SO"
    t.integer "piso"
    t.jsonb "raw_data"
    t.integer "source_id", null: false
    t.integer "source_project_id"
    t.decimal "sup_despensa", precision: 10, scale: 2
    t.decimal "sup_interior", precision: 10, scale: 2
    t.decimal "sup_jardin", precision: 10, scale: 2
    t.decimal "sup_logia", precision: 10, scale: 2
    t.decimal "sup_ponderada", precision: 10, scale: 2
    t.decimal "sup_terraza", precision: 10, scale: 2
    t.decimal "sup_terreno", precision: 10, scale: 2
    t.decimal "sup_total", precision: 10, scale: 2
    t.decimal "sup_util", precision: 10, scale: 2
    t.string "sync_batch", limit: 50
    t.datetime "synced_at", precision: nil
    t.string "tipo", limit: 100
    t.integer "tipo_bien"
    t.datetime "updated_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.string "url_imagen_1", limit: 500
    t.string "url_imagen_2", limit: 500
    t.string "url_imagen_3", limit: 500
    t.boolean "uso_goce"
    t.string "usuario_reserva", limit: 255
    t.decimal "valor_base", precision: 14, scale: 8
    t.decimal "valor_lista", precision: 14, scale: 8
    t.decimal "valor_lista_original", precision: 14, scale: 8
    t.decimal "valor_venta", precision: 14, scale: 8
    t.index ["disponible"], name: "idx_ext_mobysuite_disponible"
    t.index ["estado_bien"], name: "idx_ext_mobysuite_estado"
    t.index ["source_id"], name: "idx_ext_mobysuite_source_id"
    t.index ["source_project_id"], name: "idx_ext_mobysuite_project_id"
    t.index ["sync_batch"], name: "idx_ext_mobysuite_sync_batch"
    t.index ["tipo"], name: "idx_ext_mobysuite_tipo"
    t.unique_constraint ["source_id", "source_project_id"], name: "ext_mobysuite_source_id_source_project_id_key"
  end

  create_table "ext_mobysuite_proyectos", id: :serial, comment: "Proyectos de Mobysuite para relacionar bienes", force: :cascade do |t|
    t.boolean "activo"
    t.boolean "activo_cotizador_web"
    t.string "calle", limit: 255
    t.string "ciudad", limit: 100
    t.string "comuna", limit: 100
    t.datetime "created_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.jsonb "direccion"
    t.boolean "entrega_inmediata"
    t.bigint "fecha_escritura"
    t.bigint "fecha_inicio"
    t.bigint "fecha_termino"
    t.string "nombre", limit: 255
    t.string "nombre_legal", limit: 255
    t.string "pais", limit: 50
    t.jsonb "raw_data"
    t.string "rut", limit: 20
    t.string "sitio_web", limit: 255
    t.integer "source_id", null: false
    t.string "sync_batch", limit: 50
    t.datetime "synced_at", precision: nil
    t.datetime "updated_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.string "url_imagen", limit: 500
    t.string "url_logo", limit: 500
    t.index ["activo"], name: "idx_ext_mobysuite_proy_activo"
    t.index ["source_id"], name: "idx_ext_mobysuite_proy_source"
    t.index ["source_id"], name: "idx_ext_mobysuite_proyectos_source_id"
    t.unique_constraint ["source_id"], name: "ext_mobysuite_proyectos_source_id_key"
  end

  create_table "ext_sync_logs", id: :serial, comment: "Historial de ejecuciones de extractores", force: :cascade do |t|
    t.string "batch_id", limit: 50, null: false
    t.datetime "created_at", precision: nil, default: -> { "now()" }
    t.decimal "duration_seconds", precision: 10, scale: 2
    t.text "error_detail"
    t.text "error_message"
    t.datetime "finished_at", precision: nil
    t.integer "records_count", default: 0
    t.integer "records_failed", default: 0
    t.integer "records_inserted", default: 0
    t.string "source", limit: 50, null: false
    t.datetime "started_at", precision: nil, null: false
    t.string "status", limit: 20, null: false
    t.index ["batch_id"], name: "idx_ext_sync_logs_batch"
    t.index ["source"], name: "idx_ext_sync_logs_source"
    t.index ["started_at"], name: "idx_ext_sync_logs_started", order: :desc
    t.index ["status"], name: "idx_ext_sync_logs_status"
  end

  create_table "ext_urmenetagi_proyectos", id: :serial, force: :cascade do |t|
    t.string "banos", limit: 50
    t.integer "comuna_id"
    t.string "comuna_nombre", limit: 100
    t.datetime "created_at", precision: nil, default: -> { "now()" }
    t.decimal "desde_uf", precision: 12, scale: 2
    t.text "detalle_direccion"
    t.string "direccion", limit: 255
    t.string "direccion_sdv", limit: 255
    t.string "dormitorios", limit: 50
    t.string "email_venta", limit: 255
    t.text "equipamiento_detalle"
    t.integer "estado"
    t.string "estado_entrega", limit: 100
    t.string "fecha_entrega", limit: 100
    t.string "img_logo", limit: 255
    t.string "img_proyecto", limit: 255
    t.string "latitud", limit: 50
    t.string "longitud", limit: 50
    t.string "metros", limit: 50
    t.string "nombre_proyecto", limit: 255
    t.jsonb "raw_data"
    t.integer "source_id", null: false
    t.datetime "synced_at", precision: nil
    t.string "telefonos", limit: 100
    t.text "terminaciones_detalle"
    t.string "tipo_proyecto", limit: 50
    t.datetime "updated_at", precision: nil, default: -> { "now()" }
    t.boolean "vendido", default: false
    t.index ["comuna_nombre"], name: "idx_urmenetagi_proy_comuna"
    t.index ["estado"], name: "idx_urmenetagi_proy_estado"
    t.unique_constraint ["source_id"], name: "ext_urmenetagi_proyectos_source_id_key"
  end

  create_table "stock_cambios_log", id: :serial, force: :cascade do |t|
    t.string "campo_cambiado", limit: 50
    t.datetime "created_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.string "fuente", limit: 20
    t.string "fuente_id", limit: 50
    t.integer "propiedad_id"
    t.string "tipo_cambio", limit: 20, null: false
    t.text "valor_anterior"
    t.text "valor_nuevo"
    t.index ["created_at"], name: "idx_stock_log_fecha"
    t.index ["propiedad_id"], name: "idx_stock_log_propiedad"
  end

  create_table "stock_propiedades", id: :serial, force: :cascade do |t|
    t.integer "banos"
    t.boolean "bloqueado", default: false
    t.integer "bodegas", default: 0
    t.string "codigo", limit: 100
    t.datetime "created_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.datetime "deleted_at", precision: nil
    t.text "descripcion"
    t.integer "dormitorios"
    t.integer "estacionamientos", default: 0
    t.string "estado", limit: 20, null: false
    t.string "estado_fuente", limit: 50
    t.jsonb "fotos"
    t.string "fuente", limit: 20, null: false
    t.string "fuente_id", limit: 50, null: false
    t.string "numero", limit: 50
    t.string "orientacion", limit: 50
    t.integer "piso"
    t.decimal "precio_lista", precision: 12, scale: 2
    t.decimal "precio_venta", precision: 12, scale: 2
    t.datetime "primera_vez_visto", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.integer "proyecto_id"
    t.jsonb "raw_data"
    t.decimal "sup_terraza", precision: 10, scale: 2
    t.decimal "sup_total", precision: 10, scale: 2
    t.decimal "sup_util", precision: 10, scale: 2
    t.string "tipo", limit: 50
    t.string "tipologia", limit: 50
    t.datetime "ultima_vez_visto", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.datetime "updated_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.index ["estado", "bloqueado"], name: "idx_stock_prop_disponible", where: "(deleted_at IS NULL)"
    t.index ["estado"], name: "idx_stock_prop_estado"
    t.index ["fuente"], name: "idx_stock_prop_fuente"
    t.index ["proyecto_id"], name: "idx_stock_prop_proyecto"
    t.unique_constraint ["fuente", "fuente_id"], name: "stock_propiedades_fuente_fuente_id_key"
  end

  create_table "stock_proyectos", id: :serial, force: :cascade do |t|
    t.boolean "activo", default: true
    t.string "cod_comuna", limit: 5
    t.datetime "created_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.datetime "deleted_at", precision: nil
    t.string "direccion", limit: 255
    t.string "etapa", limit: 100
    t.string "fuente", limit: 20, null: false
    t.string "fuente_id", limit: 50, null: false
    t.string "nombre", limit: 255, null: false
    t.datetime "primera_vez_visto", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.jsonb "raw_data"
    t.string "sitio_web", limit: 500
    t.jsonb "tipologias"
    t.datetime "ultima_vez_visto", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.datetime "updated_at", precision: nil, default: -> { "CURRENT_TIMESTAMP" }
    t.string "url_imagen", limit: 500
    t.string "url_logo", limit: 500
    t.index ["activo"], name: "idx_stock_proy_activo", where: "(deleted_at IS NULL)"
    t.index ["cod_comuna"], name: "idx_stock_proy_comuna"
    t.index ["fuente"], name: "idx_stock_proy_fuente"
    t.unique_constraint ["fuente", "fuente_id"], name: "stock_proyectos_fuente_fuente_id_key"
  end

  add_foreign_key "core_broker_profiles", "core_broker_groups", column: "group_id"
  add_foreign_key "core_broker_profiles", "dom_comunas", column: "residence_commune_code", primary_key: "cod_comuna"
  add_foreign_key "core_broker_work_communes", "core_broker_profiles"
  add_foreign_key "core_broker_work_communes", "dom_comunas", column: "commune_code", primary_key: "cod_comuna"
  add_foreign_key "core_lead_properties", "core_leads"
  add_foreign_key "core_lead_properties", "stock_propiedades", column: "stock_propiedad_id"
  add_foreign_key "core_leads", "core_broker_profiles", column: "assigned_broker_profile_id"
  add_foreign_key "core_negocio_eventos", "core_negocios"
  add_foreign_key "core_negocio_tareas", "core_negocios", name: "core_negocio_tareas_core_negocio_id_fkey", on_delete: :cascade
  add_foreign_key "core_negocios", "core_broker_profiles", column: "broker_profile_id"
  add_foreign_key "core_negocios", "core_leads"
  add_foreign_key "core_negocios", "stock_propiedades", column: "stock_propiedad_id"
  add_foreign_key "core_property_assignments", "core_broker_profiles"
  add_foreign_key "core_property_assignments", "stock_propiedades", column: "stock_propiedad_id"
  add_foreign_key "core_real_states", "dom_comunas", column: "cod_comuna", primary_key: "cod_comuna"
  add_foreign_key "dom_comunas", "dom_provincias", column: "cod_provincia", primary_key: "cod_provincia", name: "dom_comunas_cod_provincia_fkey"
  add_foreign_key "dom_provincias", "dom_regiones", column: "cod_region", primary_key: "cod_region", name: "dom_provincias_cod_region_fkey"
  add_foreign_key "ext_assetplan", "ext_assetplan_condominios", column: "condominio_id", name: "ext_assetplan_condominio_id_fkey"
  add_foreign_key "ext_assetplan_condominios", "dom_comunas", column: "cod_comuna", primary_key: "cod_comuna", name: "ext_assetplan_condominios_cod_comuna_fkey"
  add_foreign_key "ext_ingevec", "ext_ingevec_proyectos", column: "proyecto_source_id", primary_key: "source_id", name: "ext_ingevec_proyecto_source_id_fkey"
  add_foreign_key "stock_cambios_log", "stock_propiedades", column: "propiedad_id", name: "stock_cambios_log_propiedad_id_fkey"
  add_foreign_key "stock_propiedades", "stock_proyectos", column: "proyecto_id", name: "stock_propiedades_proyecto_id_fkey"
  add_foreign_key "stock_proyectos", "dom_comunas", column: "cod_comuna", primary_key: "cod_comuna", name: "stock_proyectos_cod_comuna_fkey"
end
