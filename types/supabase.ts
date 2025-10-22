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
      s42_categories: {
        Row: {
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number | null
        }
      }
      s42_groups: {
        Row: {
          id: string
          name: string
          type: 'domain' | 'custom'
          domain: string | null
        }
        Insert: {
          id?: string
          name: string
          type: 'domain' | 'custom'
          domain?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: 'domain' | 'custom'
          domain?: string | null
        }
      }
      s42_menu_items: {
        Row: {
          id: string
          label: string
          icon: string | null
          href_type: 'internal' | 'external'
          href: string | null
          sort_order: number | null
          category_id: string | null
          page_id: string | null
        }
        Insert: {
          id?: string
          label: string
          icon?: string | null
          href_type: 'internal' | 'external'
          href?: string | null
          sort_order?: number | null
          category_id?: string | null
          page_id?: string | null
        }
        Update: {
          id?: string
          label?: string
          icon?: string | null
          href_type?: 'internal' | 'external'
          href?: string | null
          sort_order?: number | null
          category_id?: string | null
          page_id?: string | null
        }
      }
      s42_pages: {
        Row: {
          id: string
          title: string
          slug: string
          content_mdx: string | null
          category_id: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content_mdx?: string | null
          category_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content_mdx?: string | null
          category_id?: string | null
        }
      }
      s42_projects: {
        Row: {
          id: string
          name: string
          key: string
          description: string | null
          status: 'active' | 'completed' | 'archived'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          key: string
          description?: string | null
          status?: 'active' | 'completed' | 'archived'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          key?: string
          description?: string | null
          status?: 'active' | 'completed' | 'archived'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      s42_task_checklist: {
        Row: {
          id: string
          task_id: string
          item: string
          completed: boolean
          completed_at: string | null
          completed_by: string | null
        }
        Insert: {
          id?: string
          task_id: string
          item: string
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          item?: string
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
        }
      }
      s42_task_comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          comment?: string
          created_at?: string
        }
      }
      s42_task_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          checklist_items: string[]
          estimated_hours: number | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          checklist_items?: string[]
          estimated_hours?: number | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          checklist_items?: string[]
          estimated_hours?: number | null
        }
      }
      s42_tasks: {
        Row: {
          id: string
          project_id: string
          template_id: string | null
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'blocked' | 'done'
          assigned_to: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          template_id?: string | null
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'blocked' | 'done'
          assigned_to?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          template_id?: string | null
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'blocked' | 'done'
          assigned_to?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      s42_user_groups: {
        Row: {
          user_id: string
          group_id: string
          role: 'member' | 'admin'
        }
        Insert: {
          user_id: string
          group_id: string
          role?: 'member' | 'admin'
        }
        Update: {
          user_id?: string
          group_id?: string
          role?: 'member' | 'admin'
        }
      }
      s42_users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
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
      task_status: 'todo' | 'in_progress' | 'blocked' | 'done'
      log_level: 'debug' | 'info' | 'warn' | 'error'
    }
  }
}