export interface Board {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  template_type: 'leads' | 'free';
  folder: string | null;
  created_at: string;
  updated_at: string;
}

export interface BoardColumn {
  id: string;
  board_id: string;
  title: string;
  order_index: number;
  created_at: string;
}

export interface BoardCard {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface BoardTemplate {
  id: 'leads' | 'free';
  title: string;
  description: string;
  icon: any;
  color: string;
  features: string[];
  defaultColumns?: string[];
}
