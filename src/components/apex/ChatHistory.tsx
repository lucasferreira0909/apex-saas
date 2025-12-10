import { useState, useEffect } from "react";
import { MessageSquare, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatHistoryProps {
  onSelectConversation: (conversationId: string) => void;
  currentConversationId: string | null;
  onClose: () => void;
}

export function ChatHistory({ onSelectConversation, currentConversationId, onClose }: ChatHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('apex_conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de conversas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('apex_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      toast({
        title: "Conversa excluída",
        description: "A conversa foi removida do histórico.",
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conversa.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <MessageSquare className="w-12 h-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Nenhuma conversa ainda</p>
        <p className="text-sm text-muted-foreground/70">Suas conversas aparecerão aqui</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => {
              onSelectConversation(conversation.id);
              onClose();
            }}
            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
              currentConversationId === conversation.id
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent/50'
            }`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{conversation.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(conversation.updated_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => handleDelete(e, conversation.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
