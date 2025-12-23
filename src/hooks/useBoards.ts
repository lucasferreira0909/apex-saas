import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Board, BoardColumn, BoardCard } from '@/types/board';
import { toast } from 'sonner';

export function useBoards() {
  return useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Board[];
    }
  });
}

export function useBoard(boardId: string | null) {
  return useQuery({
    queryKey: ['board', boardId],
    queryFn: async () => {
      if (!boardId) return null;
      
      const [boardRes, columnsRes, cardsRes] = await Promise.all([
        supabase.from('boards').select('*').eq('id', boardId).single(),
        supabase.from('board_columns').select('*').eq('board_id', boardId).order('order_index'),
        supabase.from('board_cards').select('*').eq('board_id', boardId).order('order_index')
      ]);
      
      if (boardRes.error) throw boardRes.error;
      if (columnsRes.error) throw columnsRes.error;
      if (cardsRes.error) throw cardsRes.error;
      
      return {
        board: boardRes.data as Board,
        columns: columnsRes.data as BoardColumn[],
        cards: cardsRes.data as BoardCard[]
      };
    },
    enabled: !!boardId
  });
}

export async function checkBoardNameExists(name: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('boards')
    .select('id')
    .eq('user_id', userId)
    .ilike('name', name.trim())
    .limit(1);
  
  if (error) {
    console.error('Error checking board name:', error);
    return false;
  }
  
  return data && data.length > 0;
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      name: string; 
      description?: string; 
      template_type: 'leads' | 'free' | 'kanban' | 'rows';
      columns?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      // Verificar se já existe um quadro com o mesmo nome
      const exists = await checkBoardNameExists(data.name, user.id);
      if (exists) {
        throw new Error('Já existe um quadro com este nome');
      }
      
      const { data: board, error: boardError } = await supabase
        .from('boards')
        .insert({
          name: data.name,
          description: data.description,
          template_type: data.template_type,
          user_id: user.id
        })
        .select()
        .single();
      
      if (boardError) throw boardError;
      
      // Only create columns if provided and not empty
      if (data.columns && data.columns.length > 0) {
        const columnsData = data.columns.map((title, index) => ({
          board_id: board.id,
          title,
          order_index: index
        }));
        
        const { error: columnsError } = await supabase
          .from('board_columns')
          .insert(columnsData);
        
        if (columnsError) throw columnsError;
      }
      
      return board;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Quadro criado com sucesso');
    },
    onError: () => {
      toast.error('Não foi possível criar o quadro');
    }
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (boardId: string) => {
      const { error } = await supabase
        .from('boards')
        .delete()
        .eq('id', boardId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      toast.success('Quadro excluído com sucesso');
    },
    onError: () => {
      toast.error('Não foi possível excluir o quadro');
    }
  });
}
