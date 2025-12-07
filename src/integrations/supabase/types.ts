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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      campagnes: {
        Row: {
          actif: boolean | null
          created_at: string | null
          date_debut: string | null
          date_fin: string | null
          description: string | null
          groupement_id: string | null
          id: string
          nom: string
          offre_id: string | null
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          description?: string | null
          groupement_id?: string | null
          id?: string
          nom: string
          offre_id?: string | null
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          description?: string | null
          groupement_id?: string | null
          id?: string
          nom?: string
          offre_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campagnes_groupement_id_fkey"
            columns: ["groupement_id"]
            isOneToOne: false
            referencedRelation: "groupements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campagnes_offre_id_fkey"
            columns: ["offre_id"]
            isOneToOne: false
            referencedRelation: "offres"
            referencedColumns: ["id"]
          },
        ]
      }
      groupements: {
        Row: {
          code_postal: string
          created_at: string | null
          date_limite: string | null
          economie_totale: number | null
          id: string
          membres: number | null
          offre_id: string | null
          statut: Database["public"]["Enums"]["groupement_status"] | null
          updated_at: string | null
          ville: string
        }
        Insert: {
          code_postal: string
          created_at?: string | null
          date_limite?: string | null
          economie_totale?: number | null
          id?: string
          membres?: number | null
          offre_id?: string | null
          statut?: Database["public"]["Enums"]["groupement_status"] | null
          updated_at?: string | null
          ville: string
        }
        Update: {
          code_postal?: string
          created_at?: string | null
          date_limite?: string | null
          economie_totale?: number | null
          id?: string
          membres?: number | null
          offre_id?: string | null
          statut?: Database["public"]["Enums"]["groupement_status"] | null
          updated_at?: string | null
          ville?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_groupements_offre"
            columns: ["offre_id"]
            isOneToOne: false
            referencedRelation: "offres"
            referencedColumns: ["id"]
          },
        ]
      }
      offres: {
        Row: {
          actif: boolean | null
          commission: number | null
          created_at: string | null
          details_tarifs: Json | null
          economie_estimee: number | null
          fournisseur: string
          id: string
          lien_affilie: string | null
          type: Database["public"]["Enums"]["offer_type"]
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          commission?: number | null
          created_at?: string | null
          details_tarifs?: Json | null
          economie_estimee?: number | null
          fournisseur: string
          id?: string
          lien_affilie?: string | null
          type: Database["public"]["Enums"]["offer_type"]
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          commission?: number | null
          created_at?: string | null
          details_tarifs?: Json | null
          economie_estimee?: number | null
          fournisseur?: string
          id?: string
          lien_affilie?: string | null
          type?: Database["public"]["Enums"]["offer_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          code_postal: string | null
          contrats: Database["public"]["Enums"]["contract_type"] | null
          created_at: string | null
          email: string
          id: string
          nom: string
          prenom: string
          statut: Database["public"]["Enums"]["user_status"] | null
          telephone: string | null
          updated_at: string | null
          ville: string | null
        }
        Insert: {
          code_postal?: string | null
          contrats?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string | null
          email: string
          id: string
          nom: string
          prenom: string
          statut?: Database["public"]["Enums"]["user_status"] | null
          telephone?: string | null
          updated_at?: string | null
          ville?: string | null
        }
        Update: {
          code_postal?: string | null
          contrats?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string | null
          email?: string
          id?: string
          nom?: string
          prenom?: string
          statut?: Database["public"]["Enums"]["user_status"] | null
          telephone?: string | null
          updated_at?: string | null
          ville?: string | null
        }
        Relationships: []
      }
      sms_logs: {
        Row: {
          date: string | null
          id: string
          message: string
          statut: Database["public"]["Enums"]["sms_status"] | null
          user_id: string | null
        }
        Insert: {
          date?: string | null
          id?: string
          message: string
          statut?: Database["public"]["Enums"]["sms_status"] | null
          user_id?: string | null
        }
        Update: {
          date?: string | null
          id?: string
          message?: string
          statut?: Database["public"]["Enums"]["sms_status"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      souscriptions: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          offre_id: string
          statut: Database["public"]["Enums"]["subscription_status"] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          offre_id: string
          statut?: Database["public"]["Enums"]["subscription_status"] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          offre_id?: string
          statut?: Database["public"]["Enums"]["subscription_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "souscriptions_offre_id_fkey"
            columns: ["offre_id"]
            isOneToOne: false
            referencedRelation: "offres"
            referencedColumns: ["id"]
          },
        ]
      }
      stats_ville: {
        Row: {
          created_at: string | null
          date: string | null
          id: string
          membres_total: number | null
          nouveaux_inscrits: number | null
          ville: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          id?: string
          membres_total?: number | null
          nouveaux_inscrits?: number | null
          ville: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          id?: string
          membres_total?: number | null
          nouveaux_inscrits?: number | null
          ville?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      contract_type: "electricite" | "internet" | "les_deux"
      groupement_status:
        | "en_attente"
        | "negociation"
        | "offre_disponible"
        | "termine"
      offer_type: "electricite" | "internet" | "combo"
      sms_status: "envoye" | "delivre" | "echec"
      subscription_status: "en_attente" | "validee" | "annulee"
      user_status: "inscrit" | "offre_envoyee" | "clic" | "souscription"
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
      app_role: ["admin", "user"],
      contract_type: ["electricite", "internet", "les_deux"],
      groupement_status: [
        "en_attente",
        "negociation",
        "offre_disponible",
        "termine",
      ],
      offer_type: ["electricite", "internet", "combo"],
      sms_status: ["envoye", "delivre", "echec"],
      subscription_status: ["en_attente", "validee", "annulee"],
      user_status: ["inscrit", "offre_envoyee", "clic", "souscription"],
    },
  },
} as const
