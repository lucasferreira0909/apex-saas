import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Lock, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const creditPackages: Record<string, { credits: number; price: string; priceValue: number; perCredit: string }> = {
  "100": { credits: 100, price: "R$ 17,90", priceValue: 17.90, perCredit: "R$ 0,18" },
  "300": { credits: 300, price: "R$ 47,90", priceValue: 47.90, perCredit: "R$ 0,16" },
  "500": { credits: 500, price: "R$ 87,90", priceValue: 87.90, perCredit: "R$ 0,18" },
};

const planPackages: Record<string, { name: string; price: string; priceValue: number; features: string[] }> = {
  "pro": { 
    name: "Plano Pro", 
    price: "R$ 49/mês", 
    priceValue: 49.00,
    features: ["Funis e quadros ilimitados", "Ferramentas avançadas", "Relatórios detalhados", "Suporte prioritário"]
  },
};

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const packageId = searchParams.get("package") || "300";
  const packageType = searchParams.get("type") as "credits" | "plan" || "credits";
  
  const [isLoading, setIsLoading] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  
  // Form state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");

  // Get package details
  const isCredits = packageType === "credits";
  const packageDetails = isCredits 
    ? creditPackages[packageId] 
    : planPackages[packageId];

  useEffect(() => {
    if (!packageDetails) {
      toast({
        title: "Pacote inválido",
        description: "O pacote selecionado não existe.",
        variant: "destructive",
      });
      navigate("/upgrades");
    }
  }, [packageDetails, navigate, toast]);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ").slice(0, 19) : "";
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCvv(cleaned);
  };

  const validateForm = () => {
    if (!cardName.trim()) {
      toast({ title: "Erro", description: "Insira o nome no cartão.", variant: "destructive" });
      return false;
    }
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      toast({ title: "Erro", description: "Número do cartão inválido.", variant: "destructive" });
      return false;
    }
    if (!expiryMonth || !expiryYear) {
      toast({ title: "Erro", description: "Selecione a data de validade.", variant: "destructive" });
      return false;
    }
    if (cvv.length < 3) {
      toast({ title: "Erro", description: "CVV inválido.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para realizar a compra.",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("sunize-checkout", {
        body: {
          packageId,
          packageType,
          userId: user.id,
          userEmail: user.email,
          paymentDetails: {
            cardName: cardName.trim(),
            cardNumber: cardNumber.replace(/\s/g, ""),
            expiryMonth,
            expiryYear,
            cvv,
          },
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Pagamento realizado!",
          description: isCredits 
            ? `${creditPackages[packageId].credits} créditos foram adicionados à sua conta.`
            : "Seu plano foi ativado com sucesso.",
        });
        navigate("/upgrades?payment=success");
      } else {
        throw new Error(data.error || "Erro ao processar pagamento");
      }
    } catch (error: unknown) {
      console.error("Payment error:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar pagamento";
      toast({
        title: "Erro no pagamento",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!packageDetails) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/upgrades")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
          <p className="text-muted-foreground">Complete sua compra de forma segura</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-green-500" />
                <CardTitle className="text-card-foreground">Pagamento Seguro</CardTitle>
              </div>
              <CardDescription>Suas informações estão protegidas com criptografia</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <FieldSet>
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold text-card-foreground">Método de Pagamento</span>
                    </div>
                    <FieldDescription className="mb-4">
                      Todas as transações são seguras e criptografadas
                    </FieldDescription>
                    
                    <FieldGroup>
                      <Field>
                        <FieldLabel>Nome no Cartão</FieldLabel>
                        <Input 
                          placeholder="Como aparece no cartão"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          disabled={isLoading}
                          className="bg-background"
                        />
                      </Field>
                      
                      <Field>
                        <FieldLabel>Número do Cartão</FieldLabel>
                        <Input 
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          disabled={isLoading}
                          className="bg-background"
                        />
                        <FieldDescription>
                          Digite os 16 dígitos do seu cartão
                        </FieldDescription>
                      </Field>

                      <div className="grid grid-cols-3 gap-4">
                        <Field>
                          <FieldLabel>Mês</FieldLabel>
                          <Select value={expiryMonth} onValueChange={setExpiryMonth} disabled={isLoading}>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Mês" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => {
                                const month = String(i + 1).padStart(2, "0");
                                return (
                                  <SelectItem key={month} value={month}>
                                    {month}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </Field>
                        
                        <Field>
                          <FieldLabel>Ano</FieldLabel>
                          <Select value={expiryYear} onValueChange={setExpiryYear} disabled={isLoading}>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Ano" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => {
                                const year = String(2024 + i);
                                return (
                                  <SelectItem key={year} value={year}>
                                    {year}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </Field>
                        
                        <Field>
                          <FieldLabel>CVV</FieldLabel>
                          <Input 
                            placeholder="123"
                            value={cvv}
                            onChange={handleCvvChange}
                            disabled={isLoading}
                            className="bg-background"
                            type="password"
                          />
                        </Field>
                      </div>
                    </FieldGroup>
                  </FieldSet>

                  <FieldSeparator />

                  <FieldSet>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="font-semibold text-card-foreground">Endereço de Cobrança</span>
                    </div>
                    <FieldDescription className="mb-4">
                      O endereço associado ao seu método de pagamento
                    </FieldDescription>
                    
                    <Field orientation="horizontal">
                      <Checkbox 
                        id="same-address" 
                        checked={sameAsShipping}
                        onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
                        disabled={isLoading}
                      />
                      <FieldLabel htmlFor="same-address" className="cursor-pointer">
                        Mesmo endereço do cadastro
                      </FieldLabel>
                    </Field>
                  </FieldSet>

                  <FieldSeparator />

                  <Field orientation="horizontal" className="pt-4">
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Finalizar Compra
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => navigate("/upgrades")}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border sticky top-6">
            <CardHeader>
              <CardTitle className="text-card-foreground">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    {isCredits ? (
                      <Sparkles className="h-5 w-5 text-primary" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">
                      {isCredits ? `${creditPackages[packageId].credits} Créditos` : planPackages[packageId].name}
                    </h3>
                    {isCredits && (
                      <p className="text-xs text-muted-foreground">
                        {creditPackages[packageId].perCredit} por crédito
                      </p>
                    )}
                  </div>
                </div>

                {!isCredits && (
                  <ul className="space-y-1 text-sm text-muted-foreground mb-3">
                    {planPackages[packageId].features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-card-foreground">{isCredits ? creditPackages[packageId].price : "R$ 49,00"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taxas</span>
                  <span className="text-green-500">Grátis</span>
                </div>
                <FieldSeparator />
                <div className="flex justify-between font-semibold">
                  <span className="text-card-foreground">Total</span>
                  <span className="text-primary text-lg">
                    {isCredits ? creditPackages[packageId].price : "R$ 49,00"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <Lock className="h-3 w-3" />
                <span>Pagamento 100% seguro</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
