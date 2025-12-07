import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Mail, Phone, Ticket, Send } from "lucide-react";
import { toast } from "sonner";

export default function Support() {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "media"
  });
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitTicket = () => {
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const supportNumber = "5511915722726";
    
    const priorityLabel = {
      baixa: "Baixa",
      media: "Média", 
      alta: "Alta"
    }[formData.priority] || "Média";
    
    const message = `🎫 *TICKET DE SUPORTE APEX*

📌 *Assunto:* ${formData.subject}

📝 *Descrição:* ${formData.description}

⚡ *Prioridade:* ${priorityLabel}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${supportNumber}?text=${encodedMessage}`;
    
    window.open(whatsappLink, "_blank");
    
    toast.success("Redirecionando para o WhatsApp...");
    setFormData({ subject: "", description: "", priority: "media" });
  };
  return <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Suporte</h1>
        <p className="text-muted-foreground">Estamos aqui para ajudar você com qualquer dúvida</p>
      </div>

      {/* Comunidade e Ticket Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comunidade Apex */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <MessageCircle className="mr-2 h-5 w-5 text-primary" />
              Comunidade Apex
            </CardTitle>
            <CardDescription>Conecte-se com outros usuários e nossa equipe</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Junte-se à nossa comunidade no WhatsApp para receber suporte rápido, 
                dicas exclusivas e se conectar com outros usuários do Apex.
              </p>
              <Button onClick={() => window.open('https://chat.whatsapp.com/BLwCE0mb7nX1tZXxiOMKA2', '_blank')} className="w-full">
                <MessageCircle className="mr-2 h-4 w-4" />
                Entrar na Comunidade WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Novo Ticket */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center">
              <Ticket className="mr-2 h-5 w-5 text-primary" />
              Abrir Ticket
            </CardTitle>
            <CardDescription>Envie uma solicitação de suporte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input id="subject" placeholder="Descreva brevemente o problema" value={formData.subject} onChange={e => handleInputChange("subject", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" placeholder="Descreva o problema em detalhes..." value={formData.description} onChange={e => handleInputChange("description", e.target.value)} rows={3} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={formData.priority} onValueChange={value => handleInputChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmitTicket} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Enviar Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meus Tickets */}
      

      {/* Contact Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Resolução de problemas</CardTitle>
          <CardDescription>Canais alternativos para suporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-card-foreground">Email</p>
                <p className="text-sm text-muted-foreground">apex.suporte.br@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-card-foreground">Telefone</p>
                <p className="text-sm text-muted-foreground">(11) 915722726</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
}