import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MessageCircle, Copy, ExternalLink, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function WhatsAppGenerator() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/tools">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
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
              <Input
                id="phone"
                type="tel"
                placeholder="11999999999 ou (11) 99999-9999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Digite apenas números ou use formato brasileiro
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Mensagem Personalizada (Opcional)</Label>
              <Textarea
                id="message"
                placeholder="Olá! Gostaria de saber mais sobre..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
            <CardTitle>Prévia do Link</CardTitle>
            <CardDescription>Seu link do WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!generatedLink ? (
              <div className="text-center py-8">
                <Smartphone className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Preencha os dados acima para gerar seu link
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Link Display */}
                <div className="p-3 bg-muted/20 rounded-lg">
                  <Label className="text-xs text-muted-foreground">Link Gerado:</Label>
                  <div className="mt-1 text-sm text-foreground break-all">
                    {generatedLink}
                  </div>
                </div>

                {/* Preview Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Número:</span>
                    <span className="font-medium">{formatPhoneDisplay(phoneNumber)}</span>
                  </div>
                  {message && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Mensagem:</span>
                      <div className="mt-1 p-2 bg-muted/10 rounded text-xs">
                        {message}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={copyLink} variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Link
                  </Button>
                  <Button onClick={openLink} className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Testar Link
                  </Button>
                </div>

                {/* Instructions */}
                <div className="mt-4 p-4 rounded-lg bg-muted/10">
                  <h4 className="font-medium text-foreground mb-2">Como usar:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• Copie o link e use em sites, redes sociais ou e-mails</p>
                    <p>• Ao clicar, abre o WhatsApp com a conversa iniciada</p>
                    <p>• A mensagem aparecerá pré-preenchida (se configurada)</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}