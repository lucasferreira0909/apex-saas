import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Sparkles, History, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: string;
  package_id: string;
  package_type: string;
  amount: number;
  credits_added: number;
  status: string;
  created_at: string;
}

export default function Upgrades() {
  const [activeTab, setActiveTab] = useState("credits");
  const [selectedPackage, setSelectedPackage] = useState<string>("300");
  const [userCredits, setUserCredits] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const creditPackages = [
    { id: "100", credits: 100, price: "R$ 2,00", perCredit: "R$ 0,02" },
    { id: "300", credits: 300, price: "R$ 47,90", perCredit: "R$ 0,16", popular: true },
    { id: "500", credits: 500, price: "R$ 87,90", perCredit: "R$ 0,18" },
  ];

  const tabs = [
    { id: "credits", label: "Créditos", icon: Sparkles },
    { id: "plans", label: "Planos", icon: CreditCard },
    { id: "history", label: "Histórico", icon: History },
  ];

  // Fetch user credits and transactions
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setIsLoadingCredits(false);
        return;
      }

      try {
        // Fetch credits
        const { data: profile } = await supabase
          .from("profiles")
          .select("credits")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile) {
          setUserCredits(profile.credits);
        }

        // Fetch transactions
        const { data: transactionsData } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (transactionsData) {
          setTransactions(transactionsData as Transaction[]);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoadingCredits(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Handle payment callback
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      toast({
        title: "Pagamento realizado!",
        description: "Seus créditos foram adicionados à sua conta.",
      });
      // Refresh credits after successful payment
      if (user) {
        supabase
          .from("profiles")
          .select("credits")
          .eq("user_id", user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data) setUserCredits(data.credits);
          });
        
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10)
          .then(({ data }) => {
            if (data) setTransactions(data as Transaction[]);
          });
      }
    } else if (paymentStatus === "cancelled") {
      toast({
        title: "Pagamento cancelado",
        description: "O pagamento foi cancelado.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast, user]);

  const handleCreditsCheckout = () => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para comprar créditos.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/checkout?package=${selectedPackage}&type=credits`);
  };

  const handlePlanCheckout = () => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para assinar um plano.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/checkout?package=pro&type=plan`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Concluído</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Pendente</Badge>;
      case "failed":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Falhou</Badge>;
      case "refunded":
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Reembolsado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    return `R$ ${(amount / 100).toFixed(2).replace(".", ",")}`;
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
                        {isLoadingCredits ? (
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        ) : (
                          <p className="text-2xl font-bold" style={{ color: '#999999' }}>{userCredits}</p>
                        )}
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
                        onClick={() => setSelectedPackage(pkg.id)}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedPackage === pkg.id
                            ? "border-2 border-primary bg-primary/5"
                            : "border border-border hover:border-primary/50"
                        }`}
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
                  <Button className="w-full" onClick={handleCreditsCheckout}>
                    Comprar Créditos
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
                    <Button className="w-full" onClick={handlePlanCheckout}>
                      Renovar Plano
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "history" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Histórico de Transações</CardTitle>
                <CardDescription>Suas compras recentes de créditos e planos</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma transação encontrada</p>
                    <p className="text-sm">Suas compras aparecerão aqui</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-full bg-primary/10">
                            {transaction.package_type === "credits" ? (
                              <Sparkles className="h-4 w-4 text-primary" />
                            ) : (
                              <CreditCard className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-card-foreground">
                              {transaction.package_type === "credits"
                                ? `${transaction.credits_added} Créditos`
                                : "Plano Pro"}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(transaction.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold text-card-foreground">
                            {formatAmount(transaction.amount)}
                          </span>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
