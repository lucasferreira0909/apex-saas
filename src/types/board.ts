export interface Board {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  template_type: 'leads' | 'free' | 'kanban' | 'rows';
  created_at: string;
  updated_at: string;
}

export interface BoardColumn {
  id: string;
  board_id: string;
  title: string;
  icon: string | null;
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
  id: 'leads' | 'free' | 'kanban' | 'rows';
  title: string;
  description: string;
  icon: any;
  color: string;
  features: string[];
  defaultColumns?: string[];
}

export interface RowsCard {
  id: string;
  board_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}
