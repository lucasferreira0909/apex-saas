import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShoppingBag, DollarSign, Percent, TrendingUp, Tag } from "lucide-react";
import { Link } from "react-router-dom";

export default function ProductCalculator() {
  const [costPrice, setCostPrice] = useState("");
  const [desiredMargin, setDesiredMargin] = useState("");
  const [taxes, setTaxes] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [otherCosts, setOtherCosts] = useState("");

  const calculatePrice = () => {
    const cost = parseFloat(costPrice) || 0;
    const margin = parseFloat(desiredMargin) || 0;
    const tax = parseFloat(taxes) || 0;
    const shipping = parseFloat(shippingCost) || 0;
    const other = parseFloat(otherCosts) || 0;

    if (cost === 0) return { salePrice: 0, profit: 0, totalCost: 0, realMargin: 0 };

    const totalCost = cost + shipping + other;
    const taxMultiplier = 1 + (tax / 100);
    const marginMultiplier = 1 + (margin / 100);
    
    const priceBeforeTax = totalCost * marginMultiplier;
    const salePrice = priceBeforeTax * taxMultiplier;
    const profit = salePrice - totalCost - (salePrice * (tax / 100));
    const realMargin = totalCost > 0 ? ((profit / totalCost) * 100) : 0;

    return {
      salePrice: salePrice,
      profit: profit,
      totalCost: totalCost,
      realMargin: realMargin
    };
  };

  const results = calculatePrice();

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
          <h1 className="text-2xl font-bold text-foreground flex items-center">
            <ShoppingBag className="h-6 w-6 text-primary mr-2" />
            Calculador de Produto
          </h1>
          <p className="text-muted-foreground">Calcule o preço ideal para seus produtos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Produto</CardTitle>
            <CardDescription>Insira as informações de custo do seu produto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Custo do Produto (R$)</Label>
              <Input
                id="costPrice"
                type="number"
                placeholder="Ex: 50"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desiredMargin">Margem Desejada (%)</Label>
              <Input
                id="desiredMargin"
                type="number"
                placeholder="Ex: 30"
                value={desiredMargin}
                onChange={(e) => setDesiredMargin(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxes">Impostos (%)</Label>
              <Input
                id="taxes"
                type="number"
                placeholder="Ex: 10"
                value={taxes}
                onChange={(e) => setTaxes(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingCost">Custo de Frete (R$)</Label>
              <Input
                id="shippingCost"
                type="number"
                placeholder="Ex: 15"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherCosts">Outros Custos (R$)</Label>
              <Input
                id="otherCosts"
                type="number"
                placeholder="Ex: 5"
                value={otherCosts}
                onChange={(e) => setOtherCosts(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>Análise de preço do produto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-3 rounded-lg bg-muted/20">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm font-medium">Preço de Venda</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  R$ {results.salePrice.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2 p-3 rounded-lg bg-muted/20">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm font-medium">Lucro por Unidade</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  R$ {results.profit.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2 p-3 rounded-lg bg-muted/20">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm font-medium">Custo Total</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  R$ {results.totalCost.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2 p-3 rounded-lg bg-muted/20">
                <div className="flex items-center">
                  <Percent className="h-4 w-4 text-primary mr-2" />
                  <span className="text-sm font-medium">Margem Real</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {results.realMargin.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-muted/10">
              <h4 className="font-medium text-foreground mb-2">Dicas</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Margem de 30% ou mais garante boa lucratividade</p>
                <p>• Considere todos os custos ocultos (embalagem, taxas)</p>
                <p>• Compare com preços de mercado antes de definir</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
