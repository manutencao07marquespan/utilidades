export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      alert_history: {
        Row: {
          id: string
          rule_id: string | null
          triggered_at: string
          value: number | null
          message: string | null
          acknowledged: boolean
          acknowledged_by: string | null
          acknowledged_at: string | null
        }
        Insert: {
          id?: string
          rule_id?: string | null
          triggered_at?: string
          value?: number | null
          message?: string | null
          acknowledged?: boolean
          acknowledged_by?: string | null
          acknowledged_at?: string | null
        }
        Update: {
          id?: string
          rule_id?: string | null
          triggered_at?: string
          value?: number | null
          message?: string | null
          acknowledged?: boolean
          acknowledged_by?: string | null
          acknowledged_at?: string | null
        }
      }
      alert_rules: {
        Row: {
          id: string
          name: string
          parameter: string
          condition: string
          threshold: number | null
          severity: string
          is_active: boolean
          notification_method: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          parameter: string
          condition: string
          threshold?: number | null
          severity?: string
          is_active?: boolean
          notification_method?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          parameter?: string
          condition?: string
          threshold?: number | null
          severity?: string
          is_active?: boolean
          notification_method?: string
          created_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          name: string
          asset_code: string | null
          type: string
          location: string | null
          manufacturer: string | null
          model: string | null
          serial_number: string | null
          installation_date: string | null
          status: string
          specifications: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          asset_code?: string | null
          type: string
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          serial_number?: string | null
          installation_date?: string | null
          status?: string
          specifications?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          asset_code?: string | null
          type?: string
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          serial_number?: string | null
          installation_date?: string | null
          status?: string
          specifications?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string
          record_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: unknown | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: unknown | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string
          record_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: unknown | null
          user_agent?: string | null
          created_at?: string
        }
      }
      checklist_items: {
        Row: {
          id: string
          checklist_id: string
          item_index: number
          description: string
          is_completed: boolean
          observations: string | null
          photo_url: string | null
          completed_at: string | null
          completed_by: string | null
        }
        Insert: {
          id?: string
          checklist_id: string
          item_index: number
          description: string
          is_completed?: boolean
          observations?: string | null
          photo_url?: string | null
          completed_at?: string | null
          completed_by?: string | null
        }
        Update: {
          id?: string
          checklist_id?: string
          item_index?: number
          description?: string
          is_completed?: boolean
          observations?: string | null
          photo_url?: string | null
          completed_at?: string | null
          completed_by?: string | null
        }
      }
      checklist_templates: {
        Row: {
          id: string
          name: string
          type: string
          items: Json
          qr_code_data: string | null
          location_lat: number | null
          location_lng: number | null
          location_radius_meters: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          items: Json
          qr_code_data?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_radius_meters?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          items?: Json
          qr_code_data?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_radius_meters?: number
          is_active?: boolean
          created_at?: string
        }
      }
      checklists: {
        Row: {
          id: string
          template_id: string
          execution_date: string
          shift: string
          status: string
          qr_scanned_at: string | null
          scan_location_lat: number | null
          scan_location_lng: number | null
          geolocation_valid: boolean | null
          started_at: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          execution_date?: string
          shift: string
          status?: string
          qr_scanned_at?: string | null
          scan_location_lat?: number | null
          scan_location_lng?: number | null
          geolocation_valid?: boolean | null
          started_at?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          template_id?: string
          execution_date?: string
          shift?: string
          status?: string
          qr_scanned_at?: string | null
          scan_location_lat?: number | null
          scan_location_lng?: number | null
          geolocation_valid?: boolean | null
          started_at?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
        }
      }
      cistern_levels: {
        Row: {
          id: string
          reading_date: string
          shift: string
          cistern_code: string
          level_percentage: number | null
          level_meters: number | null
          observations: string | null
          recorded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reading_date?: string
          shift: string
          cistern_code: string
          level_percentage?: number | null
          level_meters?: number | null
          observations?: string | null
          recorded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reading_date?: string
          shift?: string
          cistern_code?: string
          level_percentage?: number | null
          level_meters?: number | null
          observations?: string | null
          recorded_by?: string | null
          created_at?: string
        }
      }
      daily_reports: {
        Row: {
          id: string
          report_date: string
          shift: string
          content: Json
          pdf_url: string | null
          generated_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          report_date: string
          shift: string
          content: Json
          pdf_url?: string | null
          generated_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          report_date?: string
          shift?: string
          content?: Json
          pdf_url?: string | null
          generated_by?: string | null
          created_at?: string
        }
      }
      decanter_records: {
        Row: {
          id: string
          record_date: string
          shift: string
          decanter_code: string
          action_type: string
          sludge_volume: number | null
          sludge_destination: string | null
          observations: string | null
          recorded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          record_date?: string
          shift: string
          decanter_code: string
          action_type: string
          sludge_volume?: number | null
          sludge_destination?: string | null
          observations?: string | null
          recorded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          record_date?: string
          shift?: string
          decanter_code?: string
          action_type?: string
          sludge_volume?: number | null
          sludge_destination?: string | null
          observations?: string | null
          recorded_by?: string | null
          created_at?: string
        }
      }
      drying_bed_records: {
        Row: {
          id: string
          bed_id: string
          record_date: string
          shift: string
          action_type: string
          sludge_volume: number | null
          observations: string | null
          recorded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          bed_id: string
          record_date?: string
          shift: string
          action_type: string
          sludge_volume?: number | null
          observations?: string | null
          recorded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          bed_id?: string
          record_date?: string
          shift?: string
          action_type?: string
          sludge_volume?: number | null
          observations?: string | null
          recorded_by?: string | null
          created_at?: string
        }
      }
      drying_beds: {
        Row: {
          id: string
          bed_code: string
          status: string
          sector: string | null
          last_used_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          bed_code: string
          status?: string
          sector?: string | null
          last_used_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          bed_code?: string
          status?: string
          sector?: string | null
          last_used_date?: string | null
          created_at?: string
        }
      }
      hydrant_readings: {
        Row: {
          id: string
          reading_date: string
          shift: string
          hydrant_code: string
          direction: string
          reading_value: number
          previous_reading: number | null
          consumption: number
          observations: string | null
          recorded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reading_date?: string
          shift: string
          hydrant_code: string
          direction: string
          reading_value: number
          previous_reading?: number | null
          observations?: string | null
          recorded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reading_date?: string
          shift?: string
          hydrant_code?: string
          direction?: string
          reading_value?: number
          previous_reading?: number | null
          observations?: string | null
          recorded_by?: string | null
          created_at?: string
        }
      }
      lab_analyses: {
        Row: {
          id: string
          analysis_date: string
          shift: string
          collection_point: string
          ph: number | null
          turbidity: number | null
          temperature: number | null
          decantation_efficiency: number | null
          observations: string | null
          recorded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          analysis_date?: string
          shift: string
          collection_point: string
          ph?: number | null
          turbidity?: number | null
          temperature?: number | null
          decantation_efficiency?: number | null
          observations?: string | null
          recorded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          analysis_date?: string
          shift?: string
          collection_point?: string
          ph?: number | null
          turbidity?: number | null
          temperature?: number | null
          decantation_efficiency?: number | null
          observations?: string | null
          recorded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_records: {
        Row: {
          id: string
          asset_id: string
          maintenance_type: string
          description: string
          performed_date: string | null
          next_due_date: string | null
          cost: number | null
          technician: string | null
          parts_replaced: string | null
          observations: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          asset_id: string
          maintenance_type: string
          description: string
          performed_date?: string | null
          next_due_date?: string | null
          cost?: number | null
          technician?: string | null
          parts_replaced?: string | null
          observations?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          asset_id?: string
          maintenance_type?: string
          description?: string
          performed_date?: string | null
          next_due_date?: string | null
          cost?: number | null
          technician?: string | null
          parts_replaced?: string | null
          observations?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      oil_disposals: {
        Row: {
          id: string
          disposal_date: string
          volume: number
          origin: string | null
          destination: string
          transport_company: string | null
          observations: string | null
          performed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          disposal_date?: string
          volume: number
          origin?: string | null
          destination: string
          transport_company?: string | null
          observations?: string | null
          performed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          disposal_date?: string
          volume?: number
          origin?: string | null
          destination?: string
          transport_company?: string | null
          observations?: string | null
          performed_by?: string | null
          created_at?: string
        }
      }
      preventive_activities: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          frequency_days: number
          asset_id: string | null
          responsible_role: string | null
          checklist_template: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          frequency_days?: number
          asset_id?: string | null
          responsible_role?: string | null
          checklist_template?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          frequency_days?: number
          asset_id?: string | null
          responsible_role?: string | null
          checklist_template?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      preventive_executions: {
        Row: {
          id: string
          activity_id: string
          scheduled_date: string
          completed_date: string | null
          status: string
          checklist_results: Json | null
          observations: string | null
          performed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          activity_id: string
          scheduled_date: string
          completed_date?: string | null
          status?: string
          checklist_results?: Json | null
          observations?: string | null
          performed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          activity_id?: string
          scheduled_date?: string
          completed_date?: string | null
          status?: string
          checklist_results?: Json | null
          observations?: string | null
          performed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          category: string
          unit: string
          current_stock: number
          min_stock: number
          max_stock: number | null
          supplier: string | null
          unit_price: number | null
          location: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          unit: string
          current_stock?: number
          min_stock?: number
          max_stock?: number | null
          supplier?: string | null
          unit_price?: number | null
          location?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          unit?: string
          current_stock?: number
          min_stock?: number
          max_stock?: number | null
          supplier?: string | null
          unit_price?: number | null
          location?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pump_readings: {
        Row: {
          id: string
          asset_id: string
          reading_date: string
          shift: string
          status: string
          power_kw: number | null
          flow_rate: number | null
          pressure_bar: number | null
          vibration: number | null
          temperature: number | null
          observations: string | null
          recorded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          asset_id: string
          reading_date?: string
          shift: string
          status: string
          power_kw?: number | null
          flow_rate?: number | null
          pressure_bar?: number | null
          vibration?: number | null
          temperature?: number | null
          observations?: string | null
          recorded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          asset_id?: string
          reading_date?: string
          shift?: string
          status?: string
          power_kw?: number | null
          flow_rate?: number | null
          pressure_bar?: number | null
          vibration?: number | null
          temperature?: number | null
          observations?: string | null
          recorded_by?: string | null
          created_at?: string
        }
      }
      service_requests: {
        Row: {
          id: string
          title: string
          description: string
          priority: string
          status: string
          asset_id: string | null
          requested_by: string | null
          assigned_to: string | null
          due_date: string | null
          completed_date: string | null
          cost: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          priority?: string
          status?: string
          asset_id?: string | null
          requested_by?: string | null
          assigned_to?: string | null
          due_date?: string | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          priority?: string
          status?: string
          asset_id?: string | null
          requested_by?: string | null
          assigned_to?: string | null
          due_date?: string | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      sludge_disposals: {
        Row: {
          id: string
          disposal_date: string
          source: string
          source_id: string | null
          volume: number
          destination: string
          transport_company: string | null
          transport_document: string | null
          observations: string | null
          performed_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          disposal_date?: string
          source: string
          source_id?: string | null
          volume: number
          destination: string
          transport_company?: string | null
          transport_document?: string | null
          observations?: string | null
          performed_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          disposal_date?: string
          source?: string
          source_id?: string | null
          volume?: number
          destination?: string
          transport_company?: string | null
          transport_document?: string | null
          observations?: string | null
          performed_by?: string | null
          created_at?: string
        }
      }
      solution_preparations: {
        Row: {
          id: string
          preparation_date: string
          shift: string
          product_id: string
          concentration: number | null
          volume_prepared: number
          unit: string
          batch_number: string | null
          expiry_date: string | null
          observations: string | null
          prepared_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          preparation_date?: string
          shift: string
          product_id: string
          concentration?: number | null
          volume_prepared: number
          unit?: string
          batch_number?: string | null
          expiry_date?: string | null
          observations?: string | null
          prepared_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          preparation_date?: string
          shift?: string
          product_id?: string
          concentration?: number | null
          volume_prepared?: number
          unit?: string
          batch_number?: string | null
          expiry_date?: string | null
          observations?: string | null
          prepared_by?: string | null
          created_at?: string
        }
      }
      stock_movements: {
        Row: {
          id: string
          product_id: string
          movement_type: string
          quantity: number
          unit_price: number | null
          reason: string | null
          reference_document: string | null
          performed_by: string | null
          movement_date: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          movement_type: string
          quantity: number
          unit_price?: number | null
          reason?: string | null
          reference_document?: string | null
          performed_by?: string | null
          movement_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          movement_type?: string
          quantity?: number
          unit_price?: number | null
          reason?: string | null
          reference_document?: string | null
          performed_by?: string | null
          movement_date?: string
          created_at?: string
        }
      }
      stock_predictions: {
        Row: {
          id: string
          product_id: string
          avg_daily_consumption: number | null
          days_remaining: number | null
          predicted_stockout_date: string | null
          calculation_date: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          avg_daily_consumption?: number | null
          days_remaining?: number | null
          predicted_stockout_date?: string | null
          calculation_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          avg_daily_consumption?: number | null
          days_remaining?: number | null
          predicted_stockout_date?: string | null
          calculation_date?: string
          created_at?: string
        }
      }
      system_config: {
        Row: {
          key: string
          value: Json
          description: string | null
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          full_name: string
          role: string
          department: string | null
          phone: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: string
          department?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: string
          department?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      well_horimeters: {
        Row: {
          id: string
          reading_date: string
          shift: string
          well_code: string
          current_hours: number
          previous_hours: number | null
          hours_diff: number
          observations: string | null
          recorded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reading_date?: string
          shift: string
          well_code: string
          current_hours: number
          previous_hours?: number | null
          observations?: string | null
          recorded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reading_date?: string
          shift?: string
          well_code?: string
          current_hours?: number
          previous_hours?: number | null
          observations?: string | null
          recorded_by?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
