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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_signals: {
        Row: {
          asset_id: string
          confidence: number
          created_at: string
          expires_at: string | null
          id: string
          pattern_detected: string | null
          reasoning: string | null
          sentiment_score: number | null
          signal_type: string
          stop_loss: number | null
          strength: number
          target_price: number | null
        }
        Insert: {
          asset_id: string
          confidence: number
          created_at?: string
          expires_at?: string | null
          id?: string
          pattern_detected?: string | null
          reasoning?: string | null
          sentiment_score?: number | null
          signal_type: string
          stop_loss?: number | null
          strength: number
          target_price?: number | null
        }
        Update: {
          asset_id?: string
          confidence?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          pattern_detected?: string | null
          reasoning?: string | null
          sentiment_score?: number | null
          signal_type?: string
          stop_loss?: number | null
          strength?: number
          target_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_signals_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_type: string
          created_at: string
          exchange: string | null
          id: string
          is_active: boolean | null
          name: string
          sector: string | null
          symbol: string
        }
        Insert: {
          asset_type: string
          created_at?: string
          exchange?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sector?: string | null
          symbol: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          exchange?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sector?: string | null
          symbol?: string
        }
        Relationships: []
      }
      community_messages: {
        Row: {
          asset_id: string | null
          content: string
          created_at: string
          id: string
          likes_count: number | null
          message_type: string | null
          parent_message_id: string | null
          replies_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_id?: string | null
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          message_type?: string | null
          parent_message_id?: string | null
          replies_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_id?: string | null
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          message_type?: string | null
          parent_message_id?: string | null
          replies_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_messages_parent_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "community_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      edge_logs: {
        Row: {
          created_at: string | null
          id: number
          message: string | null
          meta: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          message?: string | null
          meta?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          message?: string | null
          meta?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      education_courses: {
        Row: {
          category: string
          content: Json
          created_at: string
          created_by: string | null
          description: string | null
          difficulty_level: string
          estimated_duration: number | null
          id: string
          is_published: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level: string
          estimated_duration?: number | null
          id?: string
          is_published?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty_level?: string
          estimated_duration?: number | null
          id?: string
          is_published?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      global_markets: {
        Row: {
          change_24h: number | null
          change_percentage_24h: number | null
          current_price: number | null
          id: string
          last_updated: string | null
          market_cap: number | null
          market_type: string
          metadata: Json | null
          name: string
          symbol: string
          volume_24h: number | null
        }
        Insert: {
          change_24h?: number | null
          change_percentage_24h?: number | null
          current_price?: number | null
          id?: string
          last_updated?: string | null
          market_cap?: number | null
          market_type: string
          metadata?: Json | null
          name: string
          symbol: string
          volume_24h?: number | null
        }
        Update: {
          change_24h?: number | null
          change_percentage_24h?: number | null
          current_price?: number | null
          id?: string
          last_updated?: string | null
          market_cap?: number | null
          market_type?: string
          metadata?: Json | null
          name?: string
          symbol?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      pattern_recognition: {
        Row: {
          accuracy_score: number | null
          asset_id: string
          confidence_score: number
          detected_at: string
          id: string
          pattern_type: string
          prediction: string | null
          price_data: Json
          timeframe: string
        }
        Insert: {
          accuracy_score?: number | null
          asset_id: string
          confidence_score: number
          detected_at?: string
          id?: string
          pattern_type: string
          prediction?: string | null
          price_data: Json
          timeframe: string
        }
        Update: {
          accuracy_score?: number | null
          asset_id?: string
          confidence_score?: number
          detected_at?: string
          id?: string
          pattern_type?: string
          prediction?: string | null
          price_data?: Json
          timeframe?: string
        }
        Relationships: [
          {
            foreignKeyName: "pattern_recognition_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          created_at: string
          current_balance: number
          id: string
          initial_balance: number
          is_default: boolean | null
          name: string
          total_profit_loss: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          is_default?: boolean | null
          name?: string
          total_profit_loss?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          is_default?: boolean | null
          name?: string
          total_profit_loss?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          experience_level: string | null
          id: string
          risk_tolerance: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          experience_level?: string | null
          id?: string
          risk_tolerance?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          experience_level?: string | null
          id?: string
          risk_tolerance?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_management_rules: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          portfolio_id: string
          rule_type: string
          rule_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          portfolio_id: string
          rule_type: string
          rule_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          portfolio_id?: string
          rule_type?: string
          rule_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_management_rules_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      signal_followers: {
        Row: {
          followed_at: string
          follower_id: string
          id: string
          signal_id: string
        }
        Insert: {
          followed_at?: string
          follower_id: string
          id?: string
          signal_id: string
        }
        Update: {
          followed_at?: string
          follower_id?: string
          id?: string
          signal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signal_followers_signal_id_fkey"
            columns: ["signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["id"]
          },
        ]
      }
      signals: {
        Row: {
          asset_id: string
          confidence_level: number | null
          created_at: string
          entry_price: number
          expires_at: string | null
          followers_count: number | null
          id: string
          reasoning: string | null
          signal_type: string
          status: string
          stop_loss: number | null
          success_rate: number | null
          target_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_id: string
          confidence_level?: number | null
          created_at?: string
          entry_price: number
          expires_at?: string | null
          followers_count?: number | null
          id?: string
          reasoning?: string | null
          signal_type: string
          status?: string
          stop_loss?: number | null
          success_rate?: number | null
          target_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_id?: string
          confidence_level?: number | null
          created_at?: string
          entry_price?: number
          expires_at?: string | null
          followers_count?: number | null
          id?: string
          reasoning?: string | null
          signal_type?: string
          status?: string
          stop_loss?: number | null
          success_rate?: number | null
          target_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signals_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      social_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          asset_id: string | null
          comments_count: number | null
          content: string
          created_at: string
          id: string
          is_public: boolean | null
          likes_count: number | null
          post_type: string | null
          user_id: string
        }
        Insert: {
          asset_id?: string | null
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          post_type?: string | null
          user_id: string
        }
        Update: {
          asset_id?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          likes_count?: number | null
          post_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      trades: {
        Row: {
          ai_signal_id: string | null
          asset_id: string
          created_at: string
          executed_at: string | null
          fees: number | null
          id: string
          order_type: string
          portfolio_id: string
          price: number
          quantity: number
          status: string | null
          total_amount: number
          trade_type: string
          user_id: string
        }
        Insert: {
          ai_signal_id?: string | null
          asset_id: string
          created_at?: string
          executed_at?: string | null
          fees?: number | null
          id?: string
          order_type: string
          portfolio_id: string
          price: number
          quantity: number
          status?: string | null
          total_amount: number
          trade_type: string
          user_id: string
        }
        Update: {
          ai_signal_id?: string | null
          asset_id?: string
          created_at?: string
          executed_at?: string | null
          fees?: number | null
          id?: string
          order_type?: string
          portfolio_id?: string
          price?: number
          quantity?: number
          status?: string | null
          total_amount?: number
          trade_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trades_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_progress: {
        Row: {
          completed_at: string | null
          completed_lessons: Json | null
          course_id: string
          id: string
          progress_percentage: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_lessons?: Json | null
          course_id: string
          id?: string
          progress_percentage?: number | null
          started_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_lessons?: Json | null
          course_id?: string
          id?: string
          progress_percentage?: number | null
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "education_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlist_assets: {
        Row: {
          added_at: string
          asset_id: string
          id: string
          watchlist_id: string
        }
        Insert: {
          added_at?: string
          asset_id: string
          id?: string
          watchlist_id: string
        }
        Update: {
          added_at?: string
          asset_id?: string
          id?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_assets_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watchlist_assets_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          user_id?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
