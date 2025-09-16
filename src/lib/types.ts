export type AccessStatus = 'Granted' | 'Denied';

export type AccessLogEntry = {
  id: number;
  user_name: string;
  card_uid: string;
  timestamp: string;
  status: AccessStatus;
  reason: string;
};

export type CardData = {
  cardUID: string;
  block1Data: string;
  block2Data: string;
  userName: string;
};

export type Database = {
  public: {
    Tables: {
      access_logs: {
        Row: {
          id: number
          timestamp: string
          card_uid: string
          user_name: string
          status: string
          reason: string
        }
        Insert: {
          id?: number
          timestamp?: string
          card_uid: string
          user_name: string
          status: string
          reason: string
        }
        Update: {}
      }
      cards: {
        Row: {
          id: number
          created_at: string
          card_uid: string
          block_1_data: string | null
          block_2_data: string | null
          user_id: string | null
          access_level: string | null
          authorized_doors: string[] | null
        }
        Insert: {
          id?: number
          created_at?: string
          card_uid: string
          block_1_data?: string | null
          block_2_data?: string | null
          user_id?: string | null
          access_level?: string | null
          authorized_doors?: string[] | null
        }
        Update: {
          id?: number
          created_at?: string
          card_uid?: string
          block_1_data?: string | null
          block_2_data?: string | null
          user_id?: string | null
          access_level?: string | null
          authorized_doors?: string[] | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          user_name: string
        }
        Insert: {
          id: string
          created_at?: string
          user_name: string
        }
        Update: {
          id?: string
          created_at?: string
          user_name?: string
        }
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
