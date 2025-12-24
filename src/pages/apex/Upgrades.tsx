import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Sparkles } from "lucide-react";

export default function Upgrades() {
  const [activeTab, setActiveTab] = useState("credits");

  const tabs = [
    { id: "credits", label: "Créditos", icon: Sparkles },
    { id: "plans", label: "Planos", icon: CreditCard },
  ];

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
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground">Créditos Disponíveis</h3>
                        <p className="text-2xl font-bold text-primary">100</p>
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
                    <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <h3 className="font-semibold text-card-foreground">100 Créditos</h3>
                      <p className="text-lg font-bold text-primary mt-1">R$ 17,90</p>
                      <p className="text-xs text-muted-foreground mt-1">R$ 0,18 por crédito</p>
                    </div>
                    <div className="p-4 rounded-lg border-2 border-primary/50 bg-primary/5 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-card-foreground">300 Créditos</h3>
                        <Badge variant="secondary" className="text-xs">Popular</Badge>
                      </div>
                      <p className="text-lg font-bold mt-1" style={{ color: '#999999' }}>R$ 47,90</p>
                      <p className="text-xs text-muted-foreground mt-1">R$ 0,16 por crédito</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <h3 className="font-semibold text-card-foreground">500 Créditos</h3>
                      <p className="text-lg font-bold text-primary mt-1">R$ 87,90</p>
                      <p className="text-xs text-muted-foreground mt-1">R$ 0,18 por crédito</p>
                    </div>
                  </div>
                  <Button className="w-full">
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
                    <Button className="w-full">
                      Renovar Plano
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
