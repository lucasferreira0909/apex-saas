import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  Wrench, 
  MessageSquare, 
  Image,
  Calculator,
  FileText,
  Type,
  Mail,
  Video,
  Tag,
  MessageSquareQuote,
  Users,
  Hash,
  ShoppingBag,
  Send,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  { id: "roi-calculator", title: "Calculadora de ROI", icon: Calculator },
  { id: "product-calculator", title: "Calculadora de Produto", icon: ShoppingBag },
  { id: "copy-generator", title: "Gerador de Copy", icon: FileText },
  { id: "headline-generator", title: "Gerador de Headlines", icon: Type },
  { id: "email-generator", title: "Gerador de E-mails", icon: Mail },
  { id: "script-generator", title: "Gerador de Roteiros", icon: Video },
  { id: "image-generator", title: "Gerador de Imagens", icon: Image },
  { id: "offer-generator", title: "Gerador de Oferta", icon: Tag },
  { id: "testimonial-generator", title: "Gerador de Depoimentos", icon: MessageSquareQuote },
  { id: "persona-generator", title: "Gerador de Persona", icon: Users },
  { id: "hashtag-generator", title: "Gerador de Hashtags", icon: Hash },
  { id: "whatsapp-generator", title: "Gerador de Link WhatsApp", icon: MessageSquare },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIFlowSidebar() {
  const [toolsOpen, setToolsOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [imageGenOpen, setImageGenOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleDragStart = (event: React.DragEvent, tool: typeof tools[0]) => {
    event.dataTransfer.setData('application/json', JSON.stringify(tool));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);

    // Simulate AI response (would connect to Lovable AI in production)
    setTimeout(() => {
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: 'Olá! Sou o Apex Chat. Estou aqui para ajudar você a criar fluxos de automação incríveis. Como posso ajudar?' 
      };
      setChatMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;
    
    setIsGeneratingImage(true);
    // Simulate image generation (would connect to image generation API in production)
    setTimeout(() => {
      setIsGeneratingImage(false);
      setImagePrompt("");
    }, 2000);
  };

  return (
    <div className="w-72 border-r border-border bg-background flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Tools Section */}
          <Collapsible open={toolsOpen} onOpenChange={setToolsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  <span className="font-medium">Ferramentas</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  toolsOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="grid gap-2">
                {tools.map((tool) => {
                  const IconComponent = tool.icon;
                  return (
                    <div
                      key={tool.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, tool)}
                      className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card hover:bg-accent cursor-grab active:cursor-grabbing transition-colors"
                    >
                      <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm truncate">{tool.title}</span>
                    </div>
                  );
                })}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Apex Chat Section */}
          <Collapsible open={chatOpen} onOpenChange={setChatOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">Apex Chat</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  chatOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <Card className="border-border">
                <CardContent className="p-3 space-y-3">
                  {/* Chat Messages */}
                  <div className="h-48 overflow-y-auto space-y-2 bg-muted/30 rounded-lg p-2">
                    {chatMessages.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        Inicie uma conversa com a IA
                      </p>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={cn(
                            "text-xs p-2 rounded-lg max-w-[90%]",
                            msg.role === 'user' 
                              ? "bg-primary text-primary-foreground ml-auto" 
                              : "bg-muted"
                          )}
                        >
                          {msg.content}
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Digitando...
                      </div>
                    )}
                  </div>
                  
                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="text-xs h-8"
                    />
                    <Button 
                      size="sm" 
                      className="h-8 px-2"
                      onClick={handleSendMessage}
                      disabled={isLoading}
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Image Generator Section */}
          <Collapsible open={imageGenOpen} onOpenChange={setImageGenOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-3 py-2">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span className="font-medium">Gerador de Imagens</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  imageGenOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <Card className="border-border">
                <CardContent className="p-3 space-y-3">
                  <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center">
                    {isGeneratingImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Gerando...</span>
                      </div>
                    ) : (
                      <Image className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <Input
                    placeholder="Descreva a imagem..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="text-xs h-8"
                  />
                  <Button 
                    size="sm" 
                    className="w-full h-8"
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !imagePrompt.trim()}
                  >
                    {isGeneratingImage ? "Gerando..." : "Gerar Imagem"}
                  </Button>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
}
