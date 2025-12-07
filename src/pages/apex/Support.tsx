import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, Phone, Ticket, Send, X } from "lucide-react";

export default function Support() {
  const [generatedLink, setGeneratedLink] = useState("");

  const handleSubmitTicket = () => {
    const supportNumber = "5511915722726";
    const whatsappLink = `https://wa.me/${supportNumber}`;
    setGeneratedLink(whatsappLink);
  };

  const openWhatsApp = () => {
    window.location.href = generatedLink;
  };

  const resetForm = () => {
    setGeneratedLink("");
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
              <p className="text-sm text-muted-foreground">
                Clique no botão abaixo para abrir uma conversa com nosso suporte via WhatsApp.
              </p>
              
              {!generatedLink ? (
                <Button onClick={handleSubmitTicket} className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Ticket via WhatsApp
                </Button>
              ) : (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Pronto para abrir!</p>
                    <Button variant="ghost" size="icon" onClick={resetForm} className="h-6 w-6">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button onClick={openWhatsApp} className="w-full">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Abrir no WhatsApp
                  </Button>
                </div>
              )}
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