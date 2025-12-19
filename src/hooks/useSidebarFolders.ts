import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export interface SidebarFolderItem {
  id: string;
  folder_id: string;
  item_type: 'funnel' | 'board';
  item_id: string;
  order_index: number;
  created_at: string;
  // Joined data
  item_name?: string;
}

export interface SidebarFolder {
  id: string;
  user_id: string;
  name: string;
  order_index: number;
  created_at: string;
  items: SidebarFolderItem[];
}

export function useSidebarFolders() {
  const { user } = useAuth();
  const [folders, setFolders] = useState<SidebarFolder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFolders = useCallback(async () => {
    if (!user) {
      setFolders([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('sidebar_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true });

      if (foldersError) throw foldersError;

      if (!foldersData || foldersData.length === 0) {
        setFolders([]);
        setLoading(false);
        return;
      }

      // Fetch items for all folders
      const { data: itemsData, error: itemsError } = await supabase
        .from('sidebar_folder_items')
        .select('*')
        .in('folder_id', foldersData.map(f => f.id))
        .order('order_index', { ascending: true });

      if (itemsError) throw itemsError;

      // Fetch funnel and board names
      const funnelIds = itemsData?.filter(i => i.item_type === 'funnel').map(i => i.item_id) || [];
      const boardIds = itemsData?.filter(i => i.item_type === 'board').map(i => i.item_id) || [];

      const [funnelsResult, boardsResult] = await Promise.all([
        funnelIds.length > 0 
          ? supabase.from('funnels').select('id, name').in('id', funnelIds)
          : { data: [], error: null },
        boardIds.length > 0 
          ? supabase.from('boards').select('id, name').in('id', boardIds)
          : { data: [], error: null }
      ]);

      const funnelNames = new Map<string, string>();
      const boardNames = new Map<string, string>();
      
      funnelsResult.data?.forEach(f => funnelNames.set(f.id, f.name));
      boardsResult.data?.forEach(b => boardNames.set(b.id, b.name));

      // Map items with names
      const itemsWithNames: SidebarFolderItem[] = (itemsData || []).map(item => ({
        ...item,
        item_type: item.item_type as 'funnel' | 'board',
        item_name: item.item_type === 'funnel' 
          ? funnelNames.get(item.item_id) || undefined
          : boardNames.get(item.item_id) || undefined
      }));

      // Group items by folder
      const foldersWithItems: SidebarFolder[] = foldersData.map(folder => ({
        ...folder,
        items: itemsWithNames.filter(item => item.folder_id === folder.id)
      }));

      setFolders(foldersWithItems);
    } catch (error) {
      console.error('Error fetching sidebar folders:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as pastas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const createFolder = async (name: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('sidebar_folders')
        .insert({
          user_id: user.id,
          name,
          order_index: folders.length
        })
        .select()
        .single();

      if (error) throw error;

      await fetchFolders();
      toast({
        title: "Pasta criada",
        description: `A pasta "${name}" foi criada com sucesso.`
      });
      return data;
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a pasta.",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      const { error } = await supabase
        .from('sidebar_folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      await fetchFolders();
      toast({
        title: "Pasta excluída",
        description: "A pasta foi excluída com sucesso."
      });
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a pasta.",
        variant: "destructive"
      });
    }
  };

  const renameFolder = async (folderId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('sidebar_folders')
        .update({ name: newName })
        .eq('id', folderId);

      if (error) throw error;

      await fetchFolders();
      toast({
        title: "Pasta renomeada",
        description: "A pasta foi renomeada com sucesso."
      });
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível renomear a pasta.",
        variant: "destructive"
      });
    }
  };

  const addItemToFolder = async (folderId: string, itemType: 'funnel' | 'board', itemId: string) => {
    try {
      const folder = folders.find(f => f.id === folderId);
      const itemCount = folder?.items.length || 0;

      const { error } = await supabase
        .from('sidebar_folder_items')
        .insert({
          folder_id: folderId,
          item_type: itemType,
          item_id: itemId,
          order_index: itemCount
        });

      if (error) throw error;

      await fetchFolders();
      toast({
        title: "Projeto adicionado",
        description: "O projeto foi adicionado à pasta."
      });
    } catch (error: any) {
      console.error('Error adding item to folder:', error);
      if (error.code === '23505') {
        toast({
          title: "Projeto já existe",
          description: "Este projeto já está na pasta.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível adicionar o projeto.",
          variant: "destructive"
        });
      }
    }
  };

  const removeItemFromFolder = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('sidebar_folder_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      await fetchFolders();
      toast({
        title: "Projeto removido",
        description: "O projeto foi removido da pasta."
      });
    } catch (error) {
      console.error('Error removing item from folder:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o projeto.",
        variant: "destructive"
      });
    }
  };

  return {
    folders,
    loading,
    refetch: fetchFolders,
    createFolder,
    deleteFolder,
    renameFolder,
    addItemToFolder,
    removeItemFromFolder
  };
}
