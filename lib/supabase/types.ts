export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      committee_members: {
        Row: {
          id: string;
          login_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          login_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          login_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      member_profiles: {
        Row: {
          login_id: string;
          name: string;
          nickname: string;
          birthday_mmdd: string;
          passkey_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          login_id: string;
          name: string;
          nickname: string;
          birthday_mmdd: string;
          passkey_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          login_id?: string;
          name?: string;
          nickname?: string;
          birthday_mmdd?: string;
          passkey_hash?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          member_id: string;
          author_name: string | null;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          author_name?: string | null;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          author_name?: string | null;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "committee_members";
            referencedColumns: ["id"];
          }
        ];
      };
      dashboard_comments: {
        Row: {
          id: string;
          login_id: string;
          member_name: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          login_id: string;
          member_name: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          login_id?: string;
          member_name?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dashboard_comments_login_id_fkey";
            columns: ["login_id"];
            isOneToOne: false;
            referencedRelation: "member_profiles";
            referencedColumns: ["login_id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
