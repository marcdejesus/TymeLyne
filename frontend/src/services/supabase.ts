import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: 'ADMIN' | 'USER' | 'PREMIUM';
          avatar_url: string | null;
          bio: string | null;
          date_of_birth: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: 'ADMIN' | 'USER' | 'PREMIUM';
          avatar_url?: string | null;
          bio?: string | null;
          date_of_birth?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: 'ADMIN' | 'USER' | 'PREMIUM';
          avatar_url?: string | null;
          bio?: string | null;
          date_of_birth?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          user_id: string;
          status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
          priority: 'LOW' | 'MEDIUM' | 'HIGH';
          due_date: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
          parent_goal_id: string | null;
          is_public: boolean;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          user_id: string;
          status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
          priority?: 'LOW' | 'MEDIUM' | 'HIGH';
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          parent_goal_id?: string | null;
          is_public?: boolean;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          user_id?: string;
          status?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
          priority?: 'LOW' | 'MEDIUM' | 'HIGH';
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          parent_goal_id?: string | null;
          is_public?: boolean;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          goal_id: string;
          assigned_to: string | null;
          created_by: string;
          status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';
          priority: 'LOW' | 'MEDIUM' | 'HIGH';
          due_date: string | null;
          estimated_duration: string | null;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
          parent_task_id: string | null;
          is_recurring: boolean;
          recurrence_rule: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          goal_id: string;
          assigned_to?: string | null;
          created_by: string;
          status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';
          priority?: 'LOW' | 'MEDIUM' | 'HIGH';
          due_date?: string | null;
          estimated_duration?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          parent_task_id?: string | null;
          is_recurring?: boolean;
          recurrence_rule?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          goal_id?: string;
          assigned_to?: string | null;
          created_by?: string;
          status?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';
          priority?: 'LOW' | 'MEDIUM' | 'HIGH';
          due_date?: string | null;
          estimated_duration?: string | null;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          parent_task_id?: string | null;
          is_recurring?: boolean;
          recurrence_rule?: string | null;
        };
      };
    };
  };
}; 