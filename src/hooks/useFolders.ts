import { useState, useEffect } from 'react';

export interface Folder {
  id: string;
  name: string;
  type: 'funnel' | 'video' | 'message' | 'mixed';
  created: string;
}

const FOLDERS_STORAGE_KEY = 'apex_folders';

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (stored) {
      try {
        setFolders(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading folders:', error);
        setFolders([]);
      }
    }
  }, []);

  const saveFolders = (newFolders: Folder[]) => {
    setFolders(newFolders);
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(newFolders));
  };

  const addFolder = (name: string, type: Folder['type']) => {
    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name,
      type,
      created: new Date().toISOString(),
    };
    
    const newFolders = [...folders, newFolder];
    saveFolders(newFolders);
    return newFolder;
  };

  const deleteFolder = (id: string) => {
    const newFolders = folders.filter(f => f.id !== id);
    saveFolders(newFolders);
  };

  return {
    folders,
    addFolder,
    deleteFolder,
  };
}