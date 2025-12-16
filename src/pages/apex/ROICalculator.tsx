import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, TrendingUp, Calendar, DollarSign, Percent } from "lucide-react";
import { Link } from "react-router-dom";
export default function ROICalculator() {
  const [investment, setInvestment] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [monthlyCosts, setMonthlyCosts] = useState("");
  const calculateROI = () => {
    const inv = parseFloat(investment) || 0;
    const revenue = parseFloat(monthlyRevenue) || 0;
    const costs = parseFloat(monthlyCosts) || 0;
    if (inv === 0) return {
      roi: 0,
      profit: 0,
      payback: 0,
      margin: 0
    };
    const monthlyProfit = revenue - costs;
    const roi = (monthlyProfit * 12 - inv) / inv * 100;
    const paybackMonths = monthlyProfit > 0 ? inv / monthlyProfit : 0;
    const margin = revenue > 0 ? monthlyProfit / revenue * 100 : 0;
    return {
      roi: roi,
      profit: monthlyProfit,
      payback: paybackMonths,
      margin: margin
    };
  };
  const results = calculateROI();
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
            <Calculator className="h-6 w-6 mr-2 text-[#e8e8e8]" />
            Calculadora de ROI
          </h1>
          <p className="text-muted-foreground">Calculate o retorno do investimento dos seus projetos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Investimento</CardTitle>
            <CardDescription>Insira as informações do seu projeto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="investment">Investimento Inicial (R$)</Label>
              <Input id="investment" type="number" placeholder="Ex: 10000" value={investment} onChange={e => setInvestment(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="revenue">Receita Mensal (R$)</Label>
              <Input id="revenue" type="number" placeholder="Ex: 5000" value={monthlyRevenue} onChange={e => setMonthlyRevenue(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="costs">Custos Mensais (R$)</Label>
              <Input id="costs" type="number" placeholder="Ex: 2000" value={monthlyCosts} onChange={e => setMonthlyCosts(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>Análise do seu ROI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-3 rounded-lg bg-muted/20">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm font-medium">ROI Anual</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {results.roi.toFixed(1)}%
                </p>
              </div>
              
              <div className="space-y-2 p-3 rounded-lg bg-muted/20">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm font-medium">Lucro Mensal</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  R$ {results.profit.toFixed(0)}
                </p>
              </div>
              
              <div className="space-y-2 p-3 rounded-lg bg-muted/20">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm font-medium">Payback</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {results.payback.toFixed(1)} meses
                </p>
              </div>
              
              <div className="space-y-2 p-3 rounded-lg bg-muted/20">
                <div className="flex items-center">
                  <Percent className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm font-medium">Margem</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {results.margin.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-muted/10">
              <h4 className="font-medium text-foreground mb-2">Interpretação</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• ROI positivo indica retorno do investimento</p>
                <p>• Payback menor que 12 meses é considerado bom</p>
                <p>• Margem acima de 20% é considerada saudável</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}