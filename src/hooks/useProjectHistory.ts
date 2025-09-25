import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ProjectHistoryEntry {
  id: string;
  project_name: string;
  project_type: string;
  created_date: string;
  user_id: string;
}

export function useProjectHistory() {
  const [history, setHistory] = useState<ProjectHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchHistory = async () => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    try {
      // Use current projects data as historical data
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, type, created_at')
        .eq('user_id', user.id);

      if (projectsError) throw projectsError;

      const historyEntries: ProjectHistoryEntry[] = (projects || []).map(p => ({
        id: p.id,
        project_name: p.name,
        project_type: p.type,
        created_date: p.created_at,
        user_id: user.id
      }));

      setHistory(historyEntries);
    } catch (error) {
      console.error('Error fetching project history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (projectName: string, projectType: string, projectId: string) => {
    if (!user) return;

    const historyEntry: ProjectHistoryEntry = {
      id: projectId,
      project_name: projectName,
      project_type: projectType,
      created_date: new Date().toISOString(),
      user_id: user.id
    };

    // Update local state
    setHistory(prev => [historyEntry, ...prev]);
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  return {
    history,
    loading,
    addToHistory,
    fetchHistory,
  };
}