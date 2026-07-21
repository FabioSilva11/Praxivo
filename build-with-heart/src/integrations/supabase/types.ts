export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      historico: {
        Row: {
          acao: string
          created_at: string
          descricao: string
          detalhes: Json
          id: string
          medicamento_id: string | null
          medicamento_nome: string | null
          user_id: string
        }
        Insert: {
          acao: string
          created_at?: string
          descricao: string
          detalhes?: Json
          id?: string
          medicamento_id?: string | null
          medicamento_nome?: string | null
          user_id: string
        }
        Update: {
          acao?: string
          created_at?: string
          descricao?: string
          detalhes?: Json
          id?: string
          medicamento_id?: string | null
          medicamento_nome?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medicamentos: {
        Row: {
          categoria: string
          created_at: string
          estado: Database["public"]["Enums"]["medicamento_estado"]
          fabricacao: string
          fabricante: string
          id: string
          local: string
          lote: string
          lote_fornecedor: string | null
          nome: string
          observacoes: string | null
          quantidade: number
          tipo_quantidade: string
          unidade: string
          registro_anvisa: string | null
          prescricao_medica: boolean
          temperatura_armazenamento: string | null
          updated_at: string
          user_id: string
          validade: string
          valor_unitario: number
        }
        Insert: {
          categoria: string
          created_at?: string
          estado?: Database["public"]["Enums"]["medicamento_estado"]
          fabricacao: string
          fabricante: string
          id?: string
          local: string
          lote: string
          lote_fornecedor?: string | null
          nome: string
          observacoes?: string | null
          quantidade?: number
          tipo_quantidade?: string
          unidade: string
          registro_anvisa?: string | null
          prescricao_medica?: boolean
          temperatura_armazenamento?: string | null
          updated_at?: string
          user_id: string
          validade: string
          valor_unitario?: number
        }
        Update: {
          categoria?: string
          created_at?: string
          estado?: Database["public"]["Enums"]["medicamento_estado"]
          fabricacao?: string
          fabricante?: string
          id?: string
          local?: string
          lote?: string
          lote_fornecedor?: string | null
          nome?: string
          observacoes?: string | null
          quantidade?: number
          tipo_quantidade?: string
          unidade?: string
          registro_anvisa?: string | null
          prescricao_medica?: boolean
          temperatura_armazenamento?: string | null
          updated_at?: string
          user_id?: string
          validade?: string
          valor_unitario?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          alerts_enabled: boolean
          bio: string | null
          cargo: string | null
          cnpj: string | null
          created_at: string
          email: string
          empresa: string | null
          endereco: string | null
          id: string
          nome: string
          primary_color: string
          telefone: string | null
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alerts_enabled?: boolean
          bio?: string | null
          cargo?: string | null
          cnpj?: string | null
          created_at?: string
          email: string
          empresa?: string | null
          endereco?: string | null
          id?: string
          nome: string
          primary_color?: string
          telefone?: string | null
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alerts_enabled?: boolean
          bio?: string | null
          cargo?: string | null
          cnpj?: string | null
          created_at?: string
          email?: string
          empresa?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          primary_color?: string
          telefone?: string | null
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          id: string
          user_id: string
          titulo: string
          descricao: string
          tipo: string
          lida: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          titulo: string
          descricao?: string
          tipo?: string
          lida?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          titulo?: string
          descricao?: string
          tipo?: string
          lida?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      medicamento_estado:
        | "operacional"
        | "prioridade"
        | "transferido"
        | "doado"
        | "descartado"
        | "lixo"
        | "baixa"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      medicamento_estado: [
        "operacional",
        "prioridade",
        "transferido",
        "doado",
        "descartado",
        "lixo",
        "baixa",
      ],
    },
  },
} as const
