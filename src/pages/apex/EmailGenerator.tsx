import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, ArrowLeft, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedEmail {
  subject: string;
  preheader: string;
  body: string;
}

export default function EmailGenerator() {
  const [emailType, setEmailType] = useState("welcome");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [tone, setTone] = useState("friendly");
  const [cta, setCta] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const generateEmail = async () => {
    if (!productName.trim() || !productDescription.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha o nome e descrição do produto.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedEmail(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-email', {
        body: { emailType, productName, productDescription, tone, cta }
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      setGeneratedEmail(data);
      toast({
        title: "Email gerado!",
        description: "Seu email de marketing está pronto."
      });
    } catch (error) {
      console.error('Error generating email:', error);
      toast({
        title: "Erro ao gerar email",
        description: error instanceof Error ? error.message : "Ocorreu um erro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência."
    });
  };

  const copyAll = async () => {
    if (!generatedEmail) return;
    const fullEmail = `Assunto: ${generatedEmail.subject}\n\nPrévia: ${generatedEmail.preheader}\n\n${generatedEmail.body}`;
    await copyToClipboard(fullEmail, "all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link to="/tools">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center">
            <Mail className="h-8 w-8 mr-3 text-primary" />
            Gerador de E-mails
          </h1>
          <p className="text-muted-foreground">Crie emails de marketing que convertem</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Configurações</CardTitle>
            <CardDescription>Configure seu email de marketing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Tipo de Email</Label>
              <RadioGroup value={emailType} onValueChange={setEmailType} className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="welcome" id="welcome" />
                  <Label htmlFor="welcome" className="font-normal cursor-pointer">Boas-vindas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="followup" id="followup" />
                  <Label htmlFor="followup" className="font-normal cursor-pointer">Follow-up</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="promotion" id="promotion" />
                  <Label htmlFor="promotion" className="font-normal cursor-pointer">Promoção</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cart" id="cart" />
                  <Label htmlFor="cart" className="font-normal cursor-pointer">Carrinho Abandonado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="launch" id="launch" />
                  <Label htmlFor="launch" className="font-normal cursor-pointer">Lançamento</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productName">Nome do Produto/Serviço *</Label>
              <Input
                id="productName"
                value={productName}
                onChange={e => setProductName(e.target.value)}
                placeholder="Ex: Curso de Marketing Digital"
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productDescription">Descrição *</Label>
              <Textarea
                id="productDescription"
                value={productDescription}
                onChange={e => setProductDescription(e.target.value)}
                placeholder="Descreva o produto, seus benefícios principais e diferenciais..."
                className="bg-input border-border min-h-[100px]"
              />
            </div>

            <div className="space-y-3">
              <Label>Tom do Email</Label>
              <RadioGroup value={tone} onValueChange={setTone} className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="formal" id="formal" />
                  <Label htmlFor="formal" className="font-normal cursor-pointer">Formal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="casual" id="casual" />
                  <Label htmlFor="casual" className="font-normal cursor-pointer">Casual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="urgent" id="urgent" />
                  <Label htmlFor="urgent" className="font-normal cursor-pointer">Urgente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="friendly" id="friendly" />
                  <Label htmlFor="friendly" className="font-normal cursor-pointer">Amigável</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta">CTA Desejado (opcional)</Label>
              <Input
                id="cta"
                value={cta}
                onChange={e => setCta(e.target.value)}
                placeholder="Ex: Quero garantir minha vaga"
                className="bg-input border-border"
              />
            </div>

            <Button onClick={generateEmail} disabled={isGenerating || !productName.trim() || !productDescription.trim()} className="w-full">
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Gerando Email...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Gerar Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">Email Gerado</CardTitle>
                <CardDescription>{generatedEmail ? "Seu email está pronto!" : "Aguardando geração"}</CardDescription>
              </div>
              {generatedEmail && (
                <Button variant="outline" size="sm" onClick={copyAll}>
                  {copiedField === "all" ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  Copiar Tudo
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!generatedEmail ? (
              <div className="text-center py-12">
                <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-card-foreground mb-2">Nenhum email gerado</h3>
                <p className="text-muted-foreground">Configure e clique em "Gerar Email"</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">ASSUNTO</Label>
                    <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyToClipboard(generatedEmail.subject, "subject")}>
                      {copiedField === "subject" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <p className="font-medium text-foreground">{generatedEmail.subject}</p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">PRÉVIA</Label>
                    <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyToClipboard(generatedEmail.preheader, "preheader")}>
                      {copiedField === "preheader" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{generatedEmail.preheader}</p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">CORPO DO EMAIL</Label>
                    <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyToClipboard(generatedEmail.body, "body")}>
                      {copiedField === "body" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                  <p className="text-foreground whitespace-pre-wrap">{generatedEmail.body}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
