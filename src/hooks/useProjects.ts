import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Project {
  id: string;
  name: string;
  type: 'funnel' | 'video' | 'message';
  folder?: string;
  status: 'active' | 'completed' | 'draft' | 'paused';
  templateType?: 'sales' | 'ltv' | 'quiz';
  created: string;
  updated: string;
  stats: Record<string, string>;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProjects = async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProjects: Project[] = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        type: p.type as 'funnel' | 'video' | 'message',
        folder: p.folder || undefined,
        status: p.status as 'active' | 'completed' | 'draft' | 'paused',
        templateType: p.template_type as 'sales' | 'ltv' | 'quiz' | undefined,
        created: p.created_at,
        updated: p.updated_at,
        stats: (p.stats as Record<string, string>) || {}
      }));

      setProjects(mappedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const addProject = async (projectData: Omit<Project, 'id' | 'created' | 'updated'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectData.name,
          type: projectData.type,
          folder: projectData.folder,
          status: projectData.status,
          template_type: projectData.templateType,
          stats: projectData.stats
        })
        .select()
        .single();

      if (error) throw error;

      const newProject: Project = {
        id: data.id,
        name: data.name,
        type: data.type as 'funnel' | 'video' | 'message',
        folder: data.folder || undefined,
        status: data.status as 'active' | 'completed' | 'draft' | 'paused',
        templateType: data.template_type as 'sales' | 'ltv' | 'quiz' | undefined,
        created: data.created_at,
        updated: data.updated_at,
        stats: (data.stats as Record<string, string>) || {}
      };

      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (error) {
      console.error('Error adding project:', error);
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: updates.name,
          type: updates.type,
          folder: updates.folder,
          status: updates.status,
          template_type: updates.templateType,
          stats: updates.stats
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setProjects(prev => prev.map(p => 
        p.id === id 
          ? { ...p, ...updates, updated: new Date().toISOString() }
          : p
      ));
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const getProjectsByType = (type: Project['type']) => {
    return projects.filter(p => p.type === type);
  };

  const getProjectStats = () => {
    const total = projects.length;
    const byType = {
      funnel: projects.filter(p => p.type === 'funnel').length,
      video: projects.filter(p => p.type === 'video').length,
      message: projects.filter(p => p.type === 'message').length,
    };
    const byStatus = {
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      draft: projects.filter(p => p.status === 'draft').length,
      paused: projects.filter(p => p.status === 'paused').length,
    };

    return { total, byType, byStatus };
  };

  return {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject,
    getProjectsByType,
    getProjectStats,
    fetchProjects,
  };
}