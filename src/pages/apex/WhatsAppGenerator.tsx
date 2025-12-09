import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowLeft, MessageCircle, Copy, ExternalLink, Smartphone, Send, Bold, Italic, Strikethrough, Code, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const messageTemplates = [
  {
    id: 1,
    title: "Atendimento",
    message: "Olá! Gostaria de mais informações sobre os seus serviços. Poderia me ajudar?"
  },
  {
    id: 2,
    title: "Orçamento",
    message: "Olá! Gostaria de solicitar um orçamento para o seguinte serviço: [descreva aqui]. Aguardo retorno!"
  },
  {
    id: 3,
    title: "Agendamento",
    message: "Olá! Gostaria de agendar um horário para atendimento. Quais datas e horários estão disponíveis?"
  },
  {
    id: 4,
    title: "Suporte",
    message: "Olá! Preciso de suporte técnico. Estou enfrentando o seguinte problema: [descreva o problema]. Podem me ajudar?"
  },
  {
    id: 5,
    title: "Pedido",
    message: "Olá! Gostaria de fazer um pedido. Vocês têm disponível: [produto/serviço]? Qual o valor e prazo de entrega?"
  },
  {
    id: 6,
    title: "Parceria",
    message: "Olá! Tenho interesse em estabelecer uma parceria comercial. Podemos conversar sobre isso?"
  }
];

export default function WhatsAppGenerator() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);
    
    let prefix = "";
    let suffix = "";
    
    switch (format) {
      case "bold":
        prefix = "*";
        suffix = "*";
        break;
      case "italic":
        prefix = "_";
        suffix = "_";
        break;
      case "strikethrough":
        prefix = "~";
        suffix = "~";
        break;
      case "monospace":
        prefix = "```";
        suffix = "```";
        break;
    }
    
    const newText = message.substring(0, start) + prefix + selectedText + suffix + message.substring(end);
    setMessage(newText);
    
    // Restore focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };
  const generateLink = () => {
    if (!phoneNumber.trim()) {
      toast.error("Por favor, insira um número de telefone");
      return;
    }

    // Remove caracteres especiais e espaços do número
    const cleanNumber = phoneNumber.replace(/\D/g, "");

    // Adiciona código do país se não tiver
    const formattedNumber = cleanNumber.startsWith("55") ? cleanNumber : `55${cleanNumber}`;

    // Codifica a mensagem para URL
    const encodedMessage = encodeURIComponent(message);

    // Gera o link do WhatsApp
    const link = `https://wa.me/${formattedNumber}${encodedMessage ? `?text=${encodedMessage}` : ""}`;
    setGeneratedLink(link);
    toast.success("Link gerado com sucesso!");
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success("Link copiado para a área de transferência!");
    } catch (err) {
      toast.error("Erro ao copiar link");
    }
  };
  const openLink = () => {
    if (generatedLink) {
      window.open(generatedLink, "_blank");
    }
  };
  const formatPhoneDisplay = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/tools">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center">
            <MessageCircle className="h-6 w-6 text-primary mr-2" />
            Gerador de Link WhatsApp
          </h1>
          <p className="text-muted-foreground">Crie links diretos para conversar no WhatsApp</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar Link</CardTitle>
            <CardDescription>Insira os dados para gerar o link</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Número do WhatsApp</Label>
              <Input id="phone" type="tel" placeholder="11999999999 ou (11) 99999-9999" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
              <p className="text-xs text-muted-foreground">Digite apenas números  </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem Personalizada (Opcional)</Label>
              
              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-md border border-border">
                <ToggleGroup type="multiple" className="gap-0.5">
                  <ToggleGroupItem 
                    value="bold" 
                    aria-label="Negrito"
                    size="sm"
                    onClick={() => applyFormatting("bold")}
                    className="h-8 w-8 data-[state=on]:bg-primary/20"
                  >
                    <Bold className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="italic" 
                    aria-label="Itálico"
                    size="sm"
                    onClick={() => applyFormatting("italic")}
                    className="h-8 w-8 data-[state=on]:bg-primary/20"
                  >
                    <Italic className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="strikethrough" 
                    aria-label="Tachado"
                    size="sm"
                    onClick={() => applyFormatting("strikethrough")}
                    className="h-8 w-8 data-[state=on]:bg-primary/20"
                  >
                    <Strikethrough className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="monospace" 
                    aria-label="Monoespaçado"
                    size="sm"
                    onClick={() => applyFormatting("monospace")}
                    className="h-8 w-8 data-[state=on]:bg-primary/20"
                  >
                    <Code className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
                <span className="text-[10px] text-muted-foreground ml-auto mr-2">
                  Selecione o texto e clique para formatar
                </span>
              </div>
              
              <Textarea 
                ref={textareaRef}
                id="message" 
                placeholder="Olá! Gostaria de saber mais sobre..." 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
                rows={4} 
              />
              <p className="text-xs text-muted-foreground">
                Esta mensagem aparecerá pré-preenchida no WhatsApp
              </p>
            </div>
            
            <Button onClick={generateLink} className="w-full">
              <MessageCircle className="h-4 w-4 mr-2" />
              Gerar Link
            </Button>
          </CardContent>
        </Card>

        {/* Preview & Result */}
        <Card>
          <CardHeader>
            <CardTitle>Prévia da Conversa</CardTitle>
            <CardDescription>Visualize como será a mensagem no WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* WhatsApp Chat Mockup */}
            <div className="rounded-xl overflow-hidden border border-border">
              {/* WhatsApp Header */}
              <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#128C7E] flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">
                    {phoneNumber ? formatPhoneDisplay(phoneNumber) : "Número do contato"}
                  </p>
                  <p className="text-white/70 text-xs">online</p>
                </div>
              </div>

              {/* Chat Area */}
              <div className="p-4 min-h-[200px] flex flex-col justify-end" style={{
                backgroundColor: "#ECE5DD",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
              }}>
                {message ? (
                  <div className="flex justify-end">
                    <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none px-3 py-2 max-w-[85%] shadow-sm">
                      <div className="max-h-[120px] overflow-y-auto">
                        <p className="text-[#303030] text-sm whitespace-pre-wrap break-words">{message}</p>
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-[#667781]">
                          {new Date().toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[#667781] text-sm text-center">
                      Digite uma mensagem personalizada para visualizar a prévia
                    </p>
                  </div>
                )}
              </div>

              {/* Input Area Mockup */}
              <div className="bg-[#F0F0F0] px-3 py-2 flex items-center gap-2">
                <div className="flex-1 bg-white rounded-full px-4 py-2">
                  <p className="text-[#667781] text-sm">Mensagem</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#00A884] flex items-center justify-center">
                  <Send className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            {/* Copy Button */}
            {generatedLink && (
              <div className="space-y-3">
                <div className="p-3 bg-muted/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Link gerado:</p>
                  <p className="text-xs text-foreground break-all font-mono">{generatedLink}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyLink} className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Link
                  </Button>
                </div>
              </div>
            )}

            {!generatedLink && (
              <p className="text-center text-sm text-muted-foreground">
                Preencha os dados e clique em "Gerar Link" para obter seu link
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Message Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Modelos de Mensagem
          </CardTitle>
          <CardDescription>Escolha um modelo pronto para agilizar sua comunicação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {messageTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors group"
              >
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-medium text-foreground">{template.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-3">{template.message}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => {
                      setMessage(template.message);
                      toast.success("Modelo aplicado!");
                    }}
                  >
                    Usar Modelo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>;
}