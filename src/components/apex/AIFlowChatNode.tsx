import { memo, useState, useMemo, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, MoreVertical, Trash2, Copy, Image, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAIFlowContext } from "@/contexts/AIFlowContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
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
  const [isImageMode, setIsImageMode] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const { 
    handleDeleteNode, 
    handleDuplicateNode, 
    handleSendToTool, 
    getConnectedTools, 
    getConnectedAttachments,
    addLog,
    handleCreateTextCard,
  } = useAIFlowContext();

  // Get connected data using useMemo to avoid recalculation
  const connectedTools = useMemo(() => getConnectedTools(id), [getConnectedTools, id]);
  const connectedAttachments = useMemo(() => getConnectedAttachments(id), [getConnectedAttachments, id]);

  const processWithTool = useCallback(async (tool: ConnectedTool, input: string) => {
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
        setLastResult(result);
        
        handleSendToTool(tool.nodeId, result);
        
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
  }, [handleSendToTool, addLog]);

  const handleToolSelection = useCallback((toolLabel: string) => {
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
  }, [pendingToolSelection, pendingInput, processWithTool]);

  const handleSendMessage = useCallback(async () => {
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

    // Get fresh connected data
    const currentConnectedTools = getConnectedTools(id);
    const currentConnectedAttachments = getConnectedAttachments(id);

    // If connected to tools, route to them
    if (currentConnectedTools.length > 0) {
      if (currentConnectedTools.length === 1) {
        processWithTool(currentConnectedTools[0], currentInput);
        return;
      } else {
        const toolList = currentConnectedTools.map(t => t.label).join(', ');
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Você tem ${currentConnectedTools.length} ferramentas conectadas: ${toolList}. Qual delas deseja usar para processar esta solicitação?`
        }]);
        setPendingToolSelection(currentConnectedTools);
        setPendingInput(currentInput);
        return;
      }
    }

    setIsLoading(true);

    try {
      // Image generation mode
      if (isImageMode) {
        const { data: responseData, error } = await supabase.functions.invoke('generate-image', {
          body: { prompt: currentInput, aspectRatio: '1:1' }
        });

        if (error) {
          console.error('Error:', error);
          setMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao gerar imagem. Verifique seus créditos e tente novamente.' }]);
        } else {
          const imageUrl = responseData?.imageUrl || '';
          const assistantMessage: Message = { 
            role: 'assistant', 
            content: 'Imagem gerada com sucesso!',
            imageUrl 
          };
          setMessages(prev => [...prev, assistantMessage]);
          setLastResult(`Imagem gerada: ${imageUrl}`);
          
          if (addLog) {
            addLog({
              node_id: id,
              node_type: 'generate-image',
              input: currentInput,
              output: `Imagem: ${imageUrl}`,
            });
          }
        }
      } else {
        // Regular text mode - use Apex AI
        const attachmentsData = currentConnectedAttachments.length > 0 
          ? currentConnectedAttachments.map(a => ({
              title: a.title,
              type: a.type,
              url: a.url,
            }))
          : undefined;

        const { data: responseData, error } = await supabase.functions.invoke('process-tool-input', {
          body: { 
            toolId: 'apex-ai', 
            input: currentInput, 
            messages: [...messages, userMessage],
            attachments: attachmentsData,
          }
        });

        if (error) {
          console.error('Error:', error);
          setMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao processar. Tente novamente.' }]);
        } else {
          const result = responseData?.result || 'Sem resposta.';
          setMessages(prev => [...prev, { role: 'assistant', content: result }]);
          setLastResult(result);
          
          if (addLog) {
            addLog({
              node_id: id,
              node_type: 'apex-ai',
              input: currentInput,
              output: result,
            });
          }
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Erro de conexão.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, pendingToolSelection, handleToolSelection, id, getConnectedTools, getConnectedAttachments, processWithTool, messages, addLog, isImageMode]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleDelete = useCallback(() => {
    handleDeleteNode(id);
  }, [handleDeleteNode, id]);

  const handleDuplicate = useCallback(() => {
    handleDuplicateNode(id);
  }, [handleDuplicateNode, id]);

  const handleExport = useCallback(() => {
    if (lastResult && handleCreateTextCard) {
      handleCreateTextCard(id, lastResult);
    }
  }, [lastResult, handleCreateTextCard, id]);

  const toggleImageMode = useCallback(() => {
    setIsImageMode(prev => !prev);
  }, []);

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
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
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
        {/* Export Button */}
        {lastResult && handleCreateTextCard && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 ml-auto"
                  onClick={handleExport}
                >
                  <FileText className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exportar resultado</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
                  : isImageMode 
                    ? 'Descreva a imagem que deseja gerar'
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
                  {msg.imageUrl && (
                    <img 
                      src={msg.imageUrl} 
                      alt="Generated" 
                      className="mt-2 rounded-lg max-w-full h-auto"
                    />
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {isImageMode ? 'Gerando imagem...' : 'Processando...'}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Input Area */}
      <div className="p-3 border-t border-border flex gap-2">
        {/* Image Mode Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={isImageMode ? "default" : "outline"}
                size="sm" 
                className={cn(
                  "h-8 px-2 shrink-0",
                  isImageMode && "bg-green-500 hover:bg-green-600 text-white"
                )}
                onClick={toggleImageMode}
              >
                <Image className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isImageMode ? 'Modo imagem ativo' : 'Ativar geração de imagem'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Input
          placeholder={
            pendingToolSelection 
              ? "Digite o nome da ferramenta..." 
              : isImageMode 
                ? "Descreva a imagem..." 
                : "Digite sua mensagem..."
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
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
