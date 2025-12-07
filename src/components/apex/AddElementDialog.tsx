import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Megaphone, FileText, MousePointer, ShoppingCart, CreditCard, TrendingUp, TrendingDown, Video, Users, ThumbsUp, Gift, Star, Play, Tag, MessageCircle, Timer, Mail } from "lucide-react";

export interface ElementType {
  id: string;
  name: string;
  icon: any;
  category: string;
  description: string;
}

interface AddElementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddElement: (elementType: ElementType) => void;
  templateType?: 'sales' | 'ltv' | 'remarketing' | null;
}

const AVAILABLE_ELEMENTS: ElementType[] = [
  {
    id: "ad",
    name: "Anúncio",
    icon: Megaphone,
    category: "Tráfego",
    description: "Campanhas publicitárias para atrair visitantes"
  },
  {
    id: "presell",
    name: "Presell",
    icon: FileText,
    category: "Conteúdo",
    description: "Página de aquecimento antes da oferta"
  },
  {
    id: "capture",
    name: "Captura",
    icon: MousePointer,
    category: "Lead",
    description: "Formulário para capturar leads"
  },
  {
    id: "sales",
    name: "Página de Vendas",
    icon: ShoppingCart,
    category: "Vendas",
    description: "Apresentação da oferta principal"
  },
  {
    id: "checkout",
    name: "Checkout",
    icon: CreditCard,
    category: "Pagamento",
    description: "Finalização da compra"
  },
  {
    id: "upsell",
    name: "Upsell",
    icon: TrendingUp,
    category: "Otimização",
    description: "Oferta complementar pós-compra"
  },
  {
    id: "downsell",
    name: "Downsell",
    icon: TrendingDown,
    category: "Otimização",
    description: "Oferta alternativa com menor valor"
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Video,
    category: "Social Media",
    description: "Vídeos curtos para engajamento no TikTok"
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: ThumbsUp,
    category: "Social Media",
    description: "Posts e stories para Instagram"
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Video,
    category: "Social Media",
    description: "Conteúdo em vídeo para YouTube"
  },
  {
    id: "webinar",
    name: "Webinar",
    icon: Users,
    category: "Apresentação",
    description: "Apresentação online ao vivo ou gravada"
  },
  {
    id: "thankyou",
    name: "Página de Obrigado",
    icon: ThumbsUp,
    category: "Conversão",
    description: "Página de confirmação pós-compra"
  },
  {
    id: "benefits",
    name: "Benefícios",
    icon: Gift,
    category: "Quiz",
    description: "Apresentação dos benefícios e vantagens"
  },
  {
    id: "testimonial",
    name: "Depoimento",
    icon: Star,
    category: "Quiz",
    description: "Depoimentos e provas sociais"
  },
  {
    id: "vsl",
    name: "Página de VSL",
    icon: Play,
    category: "Quiz",
    description: "Video Sales Letter para apresentação"
  },
  {
    id: "offer",
    name: "Oferta",
    icon: Tag,
    category: "Quiz",
    description: "Apresentação da oferta especial"
  },
  {
    id: "whatsapp-message",
    name: "Mensagem WhatsApp",
    icon: MessageCircle,
    category: "Comunicação",
    description: "Envie mensagens automáticas via WhatsApp"
  },
  {
    id: "email-message",
    name: "Mensagem de Email",
    icon: Mail,
    category: "Comunicação",
    description: "Envie emails automáticos para seus leads"
  },
  {
    id: "interval",
    name: "Intervalo",
    icon: Timer,
    category: "Automação",
    description: "Aguarde um período antes do próximo passo"
  }
];

export function AddElementDialog({ open, onOpenChange, onAddElement, templateType }: AddElementDialogProps) {
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);

  // Filter elements based on template type
  const getFilteredElements = () => {
    if (templateType === 'ltv') {
      return AVAILABLE_ELEMENTS.filter(element => 
        ['upsell', 'downsell', 'thankyou'].includes(element.id)
      );
    }
    if (templateType === 'sales') {
      return AVAILABLE_ELEMENTS.filter(element => 
        ['capture', 'sales', 'checkout', 'upsell', 'downsell', 'thankyou'].includes(element.id)
      );
    }
    if (templateType === 'remarketing') {
      return AVAILABLE_ELEMENTS.filter(element => 
        ['whatsapp-message', 'email-message', 'interval', 'checkout'].includes(element.id)
      );
    }
    return AVAILABLE_ELEMENTS;
  };

  const filteredElements = getFilteredElements();

  const handleAddElement = () => {
    if (selectedElement) {
      onAddElement(selectedElement);
      setSelectedElement(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Elemento ao Funil</DialogTitle>
          <DialogDescription>
            Escolha o tipo de elemento que deseja adicionar ao seu funil de vendas
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-96 pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {filteredElements.map((element) => (
              <Card
                key={element.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedElement?.id === element.id
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedElement(element)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <element.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-foreground">{element.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {element.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{element.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAddElement} 
            disabled={!selectedElement}
          >
            Adicionar Elemento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}