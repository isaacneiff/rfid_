export type AccessStatus = 'Granted' | 'Denied';

export type AccessLogEntry = {
  id: string;
  userName: string;
  cardUID: string;
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
      cards: {
        Row: {
          id: number
          created_at: string
          card_uid: string
          block_1_data: string | null
          block_2_data: string | null
          user_id: string | null
          access_level: string | null
          authorized_doors: string[]
        }
        Insert: {
          id?: number
          created_at?: string
          card_uid: string
          block_1_data?: string | null
          block_2_data?: string | null
          user_id?: string | null
          access_level?: string | null
          authorized_doors?: string[]
        }
        Update: {
          id?: number
          created_at?: string
          card_uid?: string
          block_1_data?: string | null
          block_2_data?: string | null
          user_id?: string | null
          access_level?: string | null
          authorized_doors?: string[]
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          user_name: string
        }
        Insert: {
          id?: string
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
