import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function AIFlowChatNodeComponent({ data, selected, id }: NodeProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (data as any)?.addLog;

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    const currentInput = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const { data: responseData, error } = await supabase.functions.invoke('process-tool-input', {
        body: { toolId: 'apex-ai', input: currentInput, messages: [...messages, userMessage] }
      });

      if (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao processar. Tente novamente.' }]);
      } else {
        const result = responseData?.result || 'Sem resposta.';
        setMessages(prev => [...prev, { role: 'assistant', content: result }]);
        
        // Log the execution
        if (addLog) {
          addLog({
            node_id: id,
            node_type: 'apex-ai',
            input: currentInput,
            output: result,
          });
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro de conexão.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn(
      "w-[350px] h-[350px] shadow-md transition-all flex flex-col",
      selected && "ring-2 ring-primary",
      "border-border"
    )}>
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <MessageSquare className="h-4 w-4 text-primary" />
        </div>
        <p className="text-sm font-medium">Apex AI</p>
      </div>

      {/* Messages Area */}
      <CardContent className="flex-1 p-3 overflow-hidden">
        <ScrollArea className="h-full w-full">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-xs text-muted-foreground text-center">
                Inicie uma conversa com a IA
              </p>
            </div>
          ) : (
            <div className="space-y-2 pr-2">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "text-xs p-2 rounded-lg max-w-[85%]",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground ml-auto" 
                      : "bg-muted text-foreground"
                  )}
                >
                  {msg.content}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Digitando...
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Input Area */}
      <div className="p-3 border-t border-border flex gap-2">
        <Input
          placeholder="Digite sua mensagem..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          className="text-xs h-8 flex-1"
          disabled={isLoading}
        />
        <Button 
          size="sm" 
          className="h-8 px-2"
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-primary border-2 border-background"
      />

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
    </Card>
  );
}

export const AIFlowChatNode = memo(AIFlowChatNodeComponent);
