import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UploadOptions {
  bucket: string;
  path?: string;
  maxSizeMB?: number;
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const uploadImage = async (
    file: File, 
    options: UploadOptions
  ): Promise<{ url: string | null; error: string | null }> => {
    if (!user) {
      return { url: null, error: 'Usuário não autenticado' };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { url: null, error: 'Por favor, selecione uma imagem válida' };
    }

    // Validate file size (default 2MB)
    const maxSize = (options.maxSizeMB || 2) * 1024 * 1024;
    if (file.size > maxSize) {
      return { url: null, error: `Arquivo muito grande. Máximo ${options.maxSizeMB || 2}MB` };
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = options.path ? `${options.path}/${fileName}` : fileName;

      // Upload file
      const { data, error: uploadError } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);

      return { url: publicUrl, error: null };
    } catch (error: any) {
      console.error('Upload error:', error);
      return { url: null, error: error.message || 'Erro ao fazer upload da imagem' };
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (bucket: string, path: string) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Delete error:', error);
      return { error: error.message || 'Erro ao deletar imagem' };
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading
  };
}