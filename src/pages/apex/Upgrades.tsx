import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Sparkles, Loader2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

export default function Upgrades() {
  const [activeTab, setActiveTab] = useState("credits");
  const [selectedPackage, setSelectedPackage] = useState<string>("300");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const creditPackages = [
    { id: "100", credits: 100, price: "R$ 17,90", perCredit: "R$ 0,18" },
    { id: "300", credits: 300, price: "R$ 47,90", perCredit: "R$ 0,16", popular: true },
    { id: "500", credits: 500, price: "R$ 87,90", perCredit: "R$ 0,18" },
  ];

  const tabs = [
    { id: "credits", label: "Créditos", icon: Sparkles },
    { id: "plans", label: "Planos", icon: CreditCard },
  ];

  // Handle payment callback
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      toast({
        title: "Pagamento realizado!",
        description: "Seus créditos serão adicionados em breve.",
      });
    } else if (paymentStatus === "cancelled") {
      toast({
        title: "Pagamento cancelado",
        description: "O pagamento foi cancelado.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const handleCreditsCheckout = async () => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para comprar créditos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("sunize-checkout", {
        body: {
          packageId: selectedPackage,
          packageType: "credits",
          userId: user.id,
          userEmail: user.email,
        },
      });

      if (error) throw error;

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || "Erro ao criar sessão de pagamento");
      }
    } catch (error: unknown) {
      console.error("Checkout error:", error);
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

  const handlePlanCheckout = async () => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para assinar um plano.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("sunize-checkout", {
        body: {
          packageId: "pro",
          packageType: "plan",
          userId: user.id,
          userEmail: user.email,
        },
      });

      if (error) throw error;

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || "Erro ao criar sessão de pagamento");
      }
    } catch (error: unknown) {
      console.error("Checkout error:", error);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upgrades</h1>
        <p className="text-muted-foreground">Gerencie seus créditos e planos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Menu */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-card-foreground hover:bg-muted"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === "credits" && (
            <>
              {/* Credits Overview */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Seus Créditos</CardTitle>
                  <CardDescription>Visualize e gerencie seus créditos disponíveis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Sparkles className="h-6 w-6" style={{ color: '#e8e8e8' }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">Créditos Disponíveis</h3>
                        <p className="text-2xl font-bold" style={{ color: '#999999' }}>100</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Atualizado</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-card-foreground">Consumo de Créditos:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center justify-between">
                        <span>Geração de Textos</span>
                        <span className="font-medium">2 créditos</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Geração de Imagens</span>
                        <span className="font-medium">7 créditos</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Edição de Imagens</span>
                        <span className="font-medium">5 créditos</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Buy More Credits */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Comprar Créditos</CardTitle>
                  <CardDescription>Adquira mais créditos para usar nas ferramentas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {creditPackages.map((pkg) => (
                      <div
                        key={pkg.id}
                        onClick={() => !isLoading && setSelectedPackage(pkg.id)}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedPackage === pkg.id
                            ? "border-2 border-primary bg-primary/5"
                            : "border border-border hover:border-primary/50"
                        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-card-foreground">{pkg.credits} Créditos</h3>
                          {pkg.popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                        </div>
                        <p className="text-lg font-bold mt-1" style={{ color: '#999999' }}>{pkg.price}</p>
                        <p className="text-xs text-muted-foreground mt-1">{pkg.perCredit} por crédito</p>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" onClick={handleCreditsCheckout} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      "Comprar Créditos"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "plans" && (
            <>
              {/* Current Plan */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Plano Atual</CardTitle>
                  <CardDescription>Informações sobre seu plano de assinatura</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">Plano Gratuito</h3>
                        <p className="text-sm text-muted-foreground">Acesso básico às funcionalidades</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Ativo</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-card-foreground">Recursos incluídos:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>Funis ilimitados</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>Quadros ilimitados</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>Todas as ferramentas</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span>Suporte email/WhatsApp</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Renovar Plano */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Renovar Plano</CardTitle>
                  <CardDescription>Desbloqueie recursos avançados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border-2 border-primary/50 bg-primary/5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-card-foreground">Plano Pro</h3>
                      <span className="text-lg font-bold text-primary">R$ 49/mês</span>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                      <li>• Funis e quadros ilimitados</li>
                      <li>• Ferramentas avançadas</li>
                      <li>• Relatórios detalhados</li>
                      <li>• Suporte prioritário</li>
                    </ul>
                    <Button className="w-full" onClick={handlePlanCheckout} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        "Renovar Plano"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
