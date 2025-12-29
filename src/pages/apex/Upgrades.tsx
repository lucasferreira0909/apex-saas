import { useState } from "react";
import { ApexLayout } from "@/components/layout/ApexLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Crown, Check, Sparkles, Zap, TrendingUp, Image, FileText, Pencil } from "lucide-react";
import { useCredits, CreditTransaction } from "@/hooks/useCredits";
import { usePlanLimits, PlanType } from "@/hooks/usePlanLimits";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TabType = "credits" | "plans";

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  popular?: boolean;
}

const creditPackages: CreditPackage[] = [
  { id: "50", credits: 50, price: 17 },
  { id: "100", credits: 100, price: 27, popular: true },
  { id: "200", credits: 200, price: 47 },
];

const creditCosts = [
  { icon: FileText, name: "Geração de Textos", cost: 1 },
  { icon: Pencil, name: "Edição de Imagens", cost: 2 },
  { icon: Image, name: "Geração de Imagens", cost: 4 },
];

const growthFeatures = [
  "7 Funis",
  "14 Quadros",
  "3 Fluxos de IA",
  "Checklists ilimitados",
  "Link WhatsApp Personalizado",
  "Calculadora de ROI",
  "Calculador de Produto",
  "Gerador de Hashtags",
  "Gerador de Copy",
  "Gerador de Headline",
  "Gerador de Email",
  "Gerador de Roteiro",
  "100 Créditos Iniciais",
];

const advancedFeatures = [
  "Funis ilimitados",
  "Quadros ilimitados",
  "Fluxos de IA ilimitados",
  "Checklists ilimitados",
  "Todas as ferramentas do Growth",
  "Geração de Imagens",
  "Gerador de Depoimentos",
  "Gerador de Oferta Persuasiva",
  "Gerador de Persona",
  "200 Créditos Iniciais",
];

export default function Upgrades() {
  const [activeTab, setActiveTab] = useState<TabType>("credits");
  const [selectedPackage, setSelectedPackage] = useState<string>("100");
  const [historyPeriod, setHistoryPeriod] = useState<string>("30");
  
  const { credits, transactions, isLoading: creditsLoading, refreshTransactions } = useCredits();
  const { currentPlan, planExpiresAt, isLoading: planLoading } = usePlanLimits();

  const handlePeriodChange = (value: string) => {
    setHistoryPeriod(value);
    refreshTransactions(parseInt(value));
  };

  const handleCheckout = (packageId: string) => {
    console.log("Checkout for package:", packageId);
    // TODO: Implement checkout
  };

  const handlePlanUpgrade = (planType: PlanType) => {
    console.log("Upgrade to plan:", planType);
    // TODO: Implement plan upgrade
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      consumption: "Consumo",
      purchase: "Compra",
      initial: "Inicial",
      bonus: "Bônus",
    };
    return labels[type] || type;
  };

  const tabs = [
    { id: "credits" as TabType, label: "Créditos", icon: Coins },
    { id: "plans" as TabType, label: "Planos", icon: Crown },
  ];

  const isLoading = creditsLoading || planLoading;

  return (
    <ApexLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upgrades</h1>
          <p className="text-muted-foreground">Gerencie seus créditos e plano</p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar Navigation */}
          <Card className="h-fit">
            <CardContent className="p-4 space-y-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Content Area */}
          <div className="space-y-6">
            {activeTab === "credits" && (
              <>
                {/* Current Credits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-primary" />
                      Seus Créditos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Saldo Atual</p>
                        {isLoading ? (
                          <Skeleton className="h-10 w-24" />
                        ) : (
                          <p className="text-4xl font-bold text-primary">{credits}</p>
                        )}
                      </div>
                      <Sparkles className="h-12 w-12 text-primary/20" />
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">Consumo por Ação</p>
                      <div className="grid gap-2">
                        {creditCosts.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{item.name}</span>
                            </div>
                            <Badge variant="secondary">{item.cost} crédito{item.cost > 1 ? "s" : ""}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Buy Credits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Comprar Créditos
                    </CardTitle>
                    <CardDescription>Escolha um pacote para adicionar créditos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {creditPackages.map((pkg) => (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg.id)}
                          className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                            selectedPackage === pkg.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          {pkg.popular && (
                            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                              Popular
                            </Badge>
                          )}
                          <div className="text-center space-y-2 pt-2">
                            <p className="text-3xl font-bold text-foreground">{pkg.credits}</p>
                            <p className="text-sm text-muted-foreground">créditos</p>
                            <p className="text-xl font-semibold text-primary">
                              R$ {pkg.price.toFixed(2).replace(".", ",")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      className="w-full mt-6"
                      size="lg"
                      onClick={() => handleCheckout(selectedPackage)}
                    >
                      Comprar Créditos
                    </Button>
                  </CardContent>
                </Card>

                {/* Transaction History */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Histórico de Transações
                      </CardTitle>
                      <Select value={historyPeriod} onValueChange={handlePeriodChange}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">Últimos 7 dias</SelectItem>
                          <SelectItem value="30">Últimos 30 dias</SelectItem>
                          <SelectItem value="90">Últimos 90 dias</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Coins className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhuma transação encontrada</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="text-right">Créditos</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((transaction: CreditTransaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell className="text-muted-foreground">
                                {formatDate(transaction.created_at)}
                              </TableCell>
                              <TableCell>{transaction.description}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {getTransactionTypeLabel(transaction.transaction_type)}
                                </Badge>
                              </TableCell>
                              <TableCell className={`text-right font-medium ${
                                transaction.amount > 0 ? "text-green-500" : "text-red-500"
                              }`}>
                                {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === "plans" && (
              <>
                {/* Current Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-primary" />
                      Plano Atual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-20 w-full" />
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <p className="text-2xl font-bold">
                              {currentPlan === "advanced" ? "Plano Advanced" : "Plano Growth"}
                            </p>
                            <Badge variant="default" className="bg-green-500">Ativo</Badge>
                          </div>
                          {planExpiresAt && (
                            <p className="text-sm text-muted-foreground">
                              Expira em {format(new Date(planExpiresAt), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-primary">
                            R$ {currentPlan === "advanced" ? "167,00" : "87,00"}
                          </p>
                          <p className="text-sm text-muted-foreground">/mês</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Compare Plans */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Growth Plan */}
                  <Card className={`relative ${currentPlan === "growth" ? "ring-2 ring-primary" : ""}`}>
                    {currentPlan === "growth" && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                        Seu Plano
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">Plano Growth</CardTitle>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">R$ 87,00</span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {growthFeatures.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {currentPlan !== "growth" && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => handlePlanUpgrade("growth")}
                        >
                          Mudar para Growth
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Advanced Plan */}
                  <Card className={`relative ${currentPlan === "advanced" ? "ring-2 ring-primary" : "border-primary/50"}`}>
                    {currentPlan === "advanced" ? (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                        Seu Plano
                      </Badge>
                    ) : (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500">
                        Recomendado
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="text-xl">Plano Advanced</CardTitle>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">R$ 167,00</span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {advancedFeatures.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {currentPlan !== "advanced" && (
                        <Button
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          onClick={() => handlePlanUpgrade("advanced")}
                        >
                          Fazer Upgrade
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ApexLayout>
  );
}
