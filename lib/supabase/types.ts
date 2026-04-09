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
          name: string;
          login_id: string;
          birthday: string;
          birthday_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          login_id: string;
          birthday: string;
          birthday_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          login_id?: string;
          birthday?: string;
          birthday_hash?: string;
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
