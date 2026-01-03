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
      admin_settings: {
        Row: {
          collecte_avancee_active: boolean | null
          created_at: string | null
          email_confirmation_active: boolean | null
          email_offre_active: boolean | null
          email_statut_active: boolean | null
          id: string
          message_global: string | null
          nom_site: string | null
          pixel_publicitaire: string | null
          script_analytics: string | null
          updated_at: string | null
        }
        Insert: {
          collecte_avancee_active?: boolean | null
          created_at?: string | null
          email_confirmation_active?: boolean | null
          email_offre_active?: boolean | null
          email_statut_active?: boolean | null
          id?: string
          message_global?: string | null
          nom_site?: string | null
          pixel_publicitaire?: string | null
          script_analytics?: string | null
          updated_at?: string | null
        }
        Update: {
          collecte_avancee_active?: boolean | null
          created_at?: string | null
          email_confirmation_active?: boolean | null
          email_offre_active?: boolean | null
          email_statut_active?: boolean | null
          id?: string
          message_global?: string | null
          nom_site?: string | null
          pixel_publicitaire?: string | null
          script_analytics?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
      campaign_exports: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          export_date: string | null
          id: string
          total_profiles: number | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          export_date?: string | null
          id?: string
          total_profiles?: number | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          export_date?: string | null
          id?: string
          total_profiles?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_exports_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaign_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_settings: {
        Row: {
          created_at: string | null
          date_debut: string | null
          date_fin: string | null
          description_publique: string | null
          id: string
          message_officiel: string | null
          objectif: number | null
          prochaine_etape: string | null
          statut: Database["public"]["Enums"]["campaign_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          description_publique?: string | null
          id?: string
          message_officiel?: string | null
          objectif?: number | null
          prochaine_etape?: string | null
          statut?: Database["public"]["Enums"]["campaign_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          description_publique?: string | null
          id?: string
          message_officiel?: string | null
          objectif?: number | null
          prochaine_etape?: string | null
          statut?: Database["public"]["Enums"]["campaign_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      campaign_timeline: {
        Row: {
          completee: boolean | null
          created_at: string | null
          date_prevue: string | null
          description: string | null
          etape_numero: number
          id: string
          titre: string
          updated_at: string | null
        }
        Insert: {
          completee?: boolean | null
          created_at?: string | null
          date_prevue?: string | null
          description?: string | null
          etape_numero: number
          id?: string
          titre: string
          updated_at?: string | null
        }
        Update: {
          completee?: boolean | null
          created_at?: string | null
          date_prevue?: string | null
          description?: string | null
          etape_numero?: number
          id?: string
          titre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      campaign_users: {
        Row: {
          campaign_id: string
          created_at: string | null
          id: string
          statut_dans_campagne: string | null
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          id?: string
          statut_dans_campagne?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          id?: string
          statut_dans_campagne?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_users_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string | null
          date_debut: string | null
          date_fin: string | null
          id: string
          nom: string
          progression_acceptations_exportees: boolean | null
          progression_export_genere: boolean | null
          progression_inscriptions_cloturees: boolean | null
          progression_inscriptions_ouvertes: boolean | null
          progression_offres_envoyees: boolean | null
          progression_offres_importees: boolean | null
          statut: Database["public"]["Enums"]["new_campaign_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          id?: string
          nom: string
          progression_acceptations_exportees?: boolean | null
          progression_export_genere?: boolean | null
          progression_inscriptions_cloturees?: boolean | null
          progression_inscriptions_ouvertes?: boolean | null
          progression_offres_envoyees?: boolean | null
          progression_offres_importees?: boolean | null
          statut?: Database["public"]["Enums"]["new_campaign_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_debut?: string | null
          date_fin?: string | null
          id?: string
          nom?: string
          progression_acceptations_exportees?: boolean | null
          progression_export_genere?: boolean | null
          progression_inscriptions_cloturees?: boolean | null
          progression_inscriptions_ouvertes?: boolean | null
          progression_offres_envoyees?: boolean | null
          progression_offres_importees?: boolean | null
          statut?: Database["public"]["Enums"]["new_campaign_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      click_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          offer_id: string | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          offer_id?: string | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          offer_id?: string | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "click_events_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "user_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      export_client_mapping: {
        Row: {
          client_id: string
          created_at: string | null
          export_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          export_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          export_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "export_client_mapping_export_id_fkey"
            columns: ["export_id"]
            isOneToOne: false
            referencedRelation: "campaign_exports"
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
      housing_profiles: {
        Row: {
          chauffe_eau_electrique: boolean | null
          created_at: string
          eligible_fibre: boolean | null
          equipements_energivores: string[] | null
          facture_url: string | null
          fournisseur_electricite: string | null
          fournisseur_internet: string | null
          id: string
          isolation: string | null
          mode_chauffage: string | null
          montant_facture: number | null
          nombre_occupants: number | null
          option_tarifaire: string | null
          prix_mensuel_internet: number | null
          puissance_compteur: string | null
          recharge_vehicule_electrique: boolean | null
          satisfaction_internet: number | null
          surface: number | null
          temps_domicile: string | null
          type_connexion: string | null
          type_logement: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chauffe_eau_electrique?: boolean | null
          created_at?: string
          eligible_fibre?: boolean | null
          equipements_energivores?: string[] | null
          facture_url?: string | null
          fournisseur_electricite?: string | null
          fournisseur_internet?: string | null
          id?: string
          isolation?: string | null
          mode_chauffage?: string | null
          montant_facture?: number | null
          nombre_occupants?: number | null
          option_tarifaire?: string | null
          prix_mensuel_internet?: number | null
          puissance_compteur?: string | null
          recharge_vehicule_electrique?: boolean | null
          satisfaction_internet?: number | null
          surface?: number | null
          temps_domicile?: string | null
          type_connexion?: string | null
          type_logement?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chauffe_eau_electrique?: boolean | null
          created_at?: string
          eligible_fibre?: boolean | null
          equipements_energivores?: string[] | null
          facture_url?: string | null
          fournisseur_electricite?: string | null
          fournisseur_internet?: string | null
          id?: string
          isolation?: string | null
          mode_chauffage?: string | null
          montant_facture?: number | null
          nombre_occupants?: number | null
          option_tarifaire?: string | null
          prix_mensuel_internet?: number | null
          puissance_compteur?: string | null
          recharge_vehicule_electrique?: boolean | null
          satisfaction_internet?: number | null
          surface?: number | null
          temps_domicile?: string | null
          type_connexion?: string | null
          type_logement?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      local_seo_pages: {
        Row: {
          code_postal: string | null
          contenu_avantages: string | null
          contenu_cta: string | null
          contenu_hero: string | null
          contenu_principal: string | null
          created_at: string
          id: string
          meta_description: string | null
          mots_cles: string[] | null
          publie: boolean | null
          slug: string
          titre: string
          updated_at: string
          ville: string
        }
        Insert: {
          code_postal?: string | null
          contenu_avantages?: string | null
          contenu_cta?: string | null
          contenu_hero?: string | null
          contenu_principal?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          mots_cles?: string[] | null
          publie?: boolean | null
          slug: string
          titre: string
          updated_at?: string
          ville: string
        }
        Update: {
          code_postal?: string | null
          contenu_avantages?: string | null
          contenu_cta?: string | null
          contenu_hero?: string | null
          contenu_principal?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          mots_cles?: string[] | null
          publie?: boolean | null
          slug?: string
          titre?: string
          updated_at?: string
          ville?: string
        }
        Relationships: []
      }
      offres: {
        Row: {
          actif: boolean | null
          avantage_client: string | null
          commission: number | null
          conditions: string | null
          created_at: string | null
          date_validite: string | null
          details_tarifs: Json | null
          economie_estimee: number | null
          fichier_url: string | null
          fournisseur: string
          groupe_cible: Database["public"]["Enums"]["offer_target"] | null
          id: string
          lien_affilie: string | null
          prix_negocie: number | null
          publie: boolean | null
          type: Database["public"]["Enums"]["offer_type"]
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          avantage_client?: string | null
          commission?: number | null
          conditions?: string | null
          created_at?: string | null
          date_validite?: string | null
          details_tarifs?: Json | null
          economie_estimee?: number | null
          fichier_url?: string | null
          fournisseur: string
          groupe_cible?: Database["public"]["Enums"]["offer_target"] | null
          id?: string
          lien_affilie?: string | null
          prix_negocie?: number | null
          publie?: boolean | null
          type: Database["public"]["Enums"]["offer_type"]
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          avantage_client?: string | null
          commission?: number | null
          conditions?: string | null
          created_at?: string | null
          date_validite?: string | null
          details_tarifs?: Json | null
          economie_estimee?: number | null
          fichier_url?: string | null
          fournisseur?: string
          groupe_cible?: Database["public"]["Enums"]["offer_target"] | null
          id?: string
          lien_affilie?: string | null
          prix_negocie?: number | null
          publie?: boolean | null
          type?: Database["public"]["Enums"]["offer_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      password_reset_attempts: {
        Row: {
          attempts: number | null
          blocked_until: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          last_sms_sent_at: string | null
          phone_number: string
          reset_code: string
          used: boolean | null
        }
        Insert: {
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_sms_sent_at?: string | null
          phone_number: string
          reset_code: string
          used?: boolean | null
        }
        Update: {
          attempts?: number | null
          blocked_until?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          last_sms_sent_at?: string | null
          phone_number?: string
          reset_code?: string
          used?: boolean | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          a_reactiver: boolean | null
          code_postal: string | null
          contrats: Database["public"]["Enums"]["contract_type"] | null
          created_at: string | null
          date_derniere_activite: string | null
          email: string
          fournisseur_energie_actuel: string | null
          fournisseur_internet_actuel: string | null
          housing_form_completed: boolean | null
          housing_token: string | null
          id: string
          inclusion_campagne: boolean | null
          nom: string
          notes_admin: string | null
          prenom: string
          prix_actuel_internet: number | null
          puissance_compteur: string | null
          statut: Database["public"]["Enums"]["user_status"] | null
          telephone: string | null
          type_compteur: Database["public"]["Enums"]["compteur_type"] | null
          type_connexion_internet:
            | Database["public"]["Enums"]["connexion_type"]
            | null
          updated_at: string | null
          ville: string | null
        }
        Insert: {
          a_reactiver?: boolean | null
          code_postal?: string | null
          contrats?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string | null
          date_derniere_activite?: string | null
          email: string
          fournisseur_energie_actuel?: string | null
          fournisseur_internet_actuel?: string | null
          housing_form_completed?: boolean | null
          housing_token?: string | null
          id: string
          inclusion_campagne?: boolean | null
          nom: string
          notes_admin?: string | null
          prenom: string
          prix_actuel_internet?: number | null
          puissance_compteur?: string | null
          statut?: Database["public"]["Enums"]["user_status"] | null
          telephone?: string | null
          type_compteur?: Database["public"]["Enums"]["compteur_type"] | null
          type_connexion_internet?:
            | Database["public"]["Enums"]["connexion_type"]
            | null
          updated_at?: string | null
          ville?: string | null
        }
        Update: {
          a_reactiver?: boolean | null
          code_postal?: string | null
          contrats?: Database["public"]["Enums"]["contract_type"] | null
          created_at?: string | null
          date_derniere_activite?: string | null
          email?: string
          fournisseur_energie_actuel?: string | null
          fournisseur_internet_actuel?: string | null
          housing_form_completed?: boolean | null
          housing_token?: string | null
          id?: string
          inclusion_campagne?: boolean | null
          nom?: string
          notes_admin?: string | null
          prenom?: string
          prix_actuel_internet?: number | null
          puissance_compteur?: string | null
          statut?: Database["public"]["Enums"]["user_status"] | null
          telephone?: string | null
          type_compteur?: Database["public"]["Enums"]["compteur_type"] | null
          type_connexion_internet?:
            | Database["public"]["Enums"]["connexion_type"]
            | null
          updated_at?: string | null
          ville?: string | null
        }
        Relationships: []
      }
      seo_config: {
        Row: {
          config_key: string
          config_value: string | null
          created_at: string
          id: string
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      sms_logs: {
        Row: {
          date: string | null
          id: string
          message: string
          statut: Database["public"]["Enums"]["sms_status"] | null
          telephone: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          date?: string | null
          id?: string
          message: string
          statut?: Database["public"]["Enums"]["sms_status"] | null
          telephone?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          date?: string | null
          id?: string
          message?: string
          statut?: Database["public"]["Enums"]["sms_status"] | null
          telephone?: string | null
          type?: string | null
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
      user_offers: {
        Row: {
          abonnement_mensuel: number | null
          campaign_id: string | null
          client_id: string | null
          commentaire_fournisseur: string | null
          created_at: string | null
          economie_estimee_annuelle: number | null
          economie_estimee_mensuelle: number | null
          export_id: string | null
          fournisseur_nom: string | null
          id: string
          offer_token: string | null
          offre_nom: string | null
          prix_kwh: number | null
          statut: string | null
          token_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          abonnement_mensuel?: number | null
          campaign_id?: string | null
          client_id?: string | null
          commentaire_fournisseur?: string | null
          created_at?: string | null
          economie_estimee_annuelle?: number | null
          economie_estimee_mensuelle?: number | null
          export_id?: string | null
          fournisseur_nom?: string | null
          id?: string
          offer_token?: string | null
          offre_nom?: string | null
          prix_kwh?: number | null
          statut?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          abonnement_mensuel?: number | null
          campaign_id?: string | null
          client_id?: string | null
          commentaire_fournisseur?: string | null
          created_at?: string | null
          economie_estimee_annuelle?: number | null
          economie_estimee_mensuelle?: number | null
          export_id?: string | null
          fournisseur_nom?: string | null
          id?: string
          offer_token?: string | null
          offre_nom?: string | null
          prix_kwh?: number | null
          statut?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_offers_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_offers_export_id_fkey"
            columns: ["export_id"]
            isOneToOne: false
            referencedRelation: "campaign_exports"
            referencedColumns: ["id"]
          },
        ]
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
      cleanup_expired_reset_attempts: { Args: never; Returns: undefined }
      get_offer_by_token: {
        Args: { p_token: string }
        Returns: {
          abonnement_mensuel: number
          commentaire_fournisseur: string
          economie_estimee_annuelle: number
          economie_estimee_mensuelle: number
          fournisseur_nom: string
          id: string
          is_expired: boolean
          offre_nom: string
          prix_kwh: number
          statut: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_housing_profile_with_token: {
        Args: {
          p_chauffe_eau_electrique: boolean
          p_eligible_fibre: boolean
          p_equipements_energivores: string[]
          p_fournisseur_electricite: string
          p_fournisseur_internet: string
          p_isolation: string
          p_mode_chauffage: string
          p_montant_facture: number
          p_nombre_occupants: number
          p_option_tarifaire: string
          p_prix_mensuel_internet: number
          p_puissance_compteur: string
          p_recharge_vehicule_electrique: boolean
          p_satisfaction_internet: number
          p_surface: number
          p_temps_domicile: string
          p_token: string
          p_type_connexion: string
          p_type_logement: string
        }
        Returns: boolean
      }
      update_offer_status_by_token: {
        Args: { p_statut: string; p_token: string }
        Returns: boolean
      }
      validate_housing_token: {
        Args: { p_token: string }
        Returns: {
          form_completed: boolean
          user_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      campaign_status:
        | "ouverte"
        | "fermee"
        | "en_negociation"
        | "offre_prete"
        | "archivee"
      compteur_type: "linky" | "ancien"
      connexion_type: "fibre" | "adsl" | "4g_box"
      contract_type: "electricite" | "internet" | "les_deux" | "gaz"
      groupement_status:
        | "en_attente"
        | "negociation"
        | "offre_disponible"
        | "termine"
      new_campaign_status:
        | "inscriptions_ouvertes"
        | "inscriptions_cloturees"
        | "export_genere"
        | "offres_importees"
        | "offres_envoyees"
        | "terminee"
      offer_target: "energie" | "internet" | "tous"
      offer_type: "electricite" | "internet" | "combo" | "gaz"
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
      campaign_status: [
        "ouverte",
        "fermee",
        "en_negociation",
        "offre_prete",
        "archivee",
      ],
      compteur_type: ["linky", "ancien"],
      connexion_type: ["fibre", "adsl", "4g_box"],
      contract_type: ["electricite", "internet", "les_deux", "gaz"],
      groupement_status: [
        "en_attente",
        "negociation",
        "offre_disponible",
        "termine",
      ],
      new_campaign_status: [
        "inscriptions_ouvertes",
        "inscriptions_cloturees",
        "export_genere",
        "offres_importees",
        "offres_envoyees",
        "terminee",
      ],
      offer_target: ["energie", "internet", "tous"],
      offer_type: ["electricite", "internet", "combo", "gaz"],
      sms_status: ["envoye", "delivre", "echec"],
      subscription_status: ["en_attente", "validee", "annulee"],
      user_status: ["inscrit", "offre_envoyee", "clic", "souscription"],
    },
  },
} as const
