import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, MoreVertical, Trash2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ConnectedTool {
  nodeId: string;
  toolId: string;
  label: string;
}

function AIFlowChatNodeComponent({ data, selected, id }: NodeProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingToolSelection, setPendingToolSelection] = useState<ConnectedTool[] | null>(null);
  const [pendingInput, setPendingInput] = useState<string>("");

  const addLog = (data as any)?.addLog;
  const connectedTools: ConnectedTool[] = (data as any)?.connectedTools || [];
  const connectedAttachments: any[] = (data as any)?.connectedAttachments || [];
  const onSendToTool = (data as any)?.onSendToTool;
  const onDelete = (data as any)?.onDelete;
  const onDuplicate = (data as any)?.onDuplicate;

  const processWithTool = async (tool: ConnectedTool, input: string) => {
    setIsLoading(true);
    
    try {
      const { data: responseData, error } = await supabase.functions.invoke('process-tool-input', {
        body: { toolId: tool.toolId, input }
      });

      if (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, { role: 'assistant', content: `Erro ao processar com ${tool.label}. Tente novamente.` }]);
      } else {
        const result = responseData?.result || 'Sem resposta.';
        setMessages(prev => [...prev, { role: 'assistant', content: `Resultado enviado para ${tool.label}!` }]);
        
        // Send result to the tool node
        if (onSendToTool) {
          onSendToTool(tool.nodeId, result);
        }
        
        // Log the execution
        if (addLog) {
          addLog({
            node_id: tool.nodeId,
            node_type: tool.toolId,
            input,
            output: result,
          });
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro de conexão.' }]);
    } finally {
      setIsLoading(false);
      setPendingToolSelection(null);
      setPendingInput("");
    }
  };

  const handleToolSelection = (toolLabel: string) => {
    if (!pendingToolSelection || !pendingInput) return;
    
    const selectedTool = pendingToolSelection.find(t => 
      t.label.toLowerCase().includes(toolLabel.toLowerCase()) ||
      toolLabel.toLowerCase().includes(t.label.toLowerCase().split(' ').pop() || '')
    );
    
    if (selectedTool) {
      processWithTool(selectedTool, pendingInput);
    } else {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Não encontrei essa ferramenta. Por favor, escolha entre: ${pendingToolSelection.map(t => t.label).join(', ')}`
      }]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    const currentInput = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Check if we're waiting for tool selection
    if (pendingToolSelection && pendingToolSelection.length > 0) {
      handleToolSelection(currentInput);
      return;
    }

    // If connected to tools, route to them
    if (connectedTools.length > 0) {
      if (connectedTools.length === 1) {
        // Single tool connected - use it directly
        processWithTool(connectedTools[0], currentInput);
        return;
      } else {
        // Multiple tools connected - ask which one to use
        const toolList = connectedTools.map(t => t.label).join(', ');
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Você tem ${connectedTools.length} ferramentas conectadas: ${toolList}. Qual delas deseja usar para processar esta solicitação?`
        }]);
        setPendingToolSelection(connectedTools);
        setPendingInput(currentInput);
        return;
      }
    }

    // No tools connected - use Apex AI directly
    setIsLoading(true);

    try {
      // Build context from attachments
      let contextInfo = '';
      if (connectedAttachments.length > 0) {
        contextInfo = '\n\nAnexos conectados:\n' + connectedAttachments.map(a => 
          `- ${a.title} (${a.type}): ${a.url}`
        ).join('\n');
      }

      const { data: responseData, error } = await supabase.functions.invoke('process-tool-input', {
        body: { 
          toolId: 'apex-ai', 
          input: currentInput + contextInfo, 
          messages: [...messages, userMessage] 
        }
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
      "w-[350px] h-[350px] shadow-md transition-all flex flex-col relative group",
      selected && "ring-2 ring-primary",
      "border-border"
    )}>
      {/* Menu Button */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="h-6 w-6 bg-background/80 backdrop-blur-sm">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border z-50">
            <DropdownMenuItem onClick={() => onDuplicate?.(id)}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete?.(id)} className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <MessageSquare className="h-4 w-4 text-primary" />
        </div>
        <p className="text-sm font-medium">Apex AI</p>
        {connectedTools.length > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">
            {connectedTools.length} ferramenta{connectedTools.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Messages Area */}
      <CardContent className="flex-1 p-3 overflow-hidden">
        <ScrollArea className="h-full w-full">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-xs text-muted-foreground text-center">
                {connectedTools.length > 0 
                  ? 'Faça uma solicitação para enviar às ferramentas conectadas'
                  : 'Inicie uma conversa com a IA'
                }
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
                  Processando...
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Input Area */}
      <div className="p-3 border-t border-border flex gap-2">
        <Input
          placeholder={pendingToolSelection ? "Digite o nome da ferramenta..." : "Digite sua mensagem..."}
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

      {/* Input Handle - receives from tools/attachments */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-primary border-2 border-background"
      />

      {/* Output Handle - sends to tools */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-primary border-2 border-background"
      />
    </Card>
  );
}

export const AIFlowChatNode = memo(AIFlowChatNodeComponent);
