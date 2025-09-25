import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Save, 
  ArrowLeft, 
  Send,
  Settings,
  MessageSquare,
  Plus,
  Clock,
  Image,
  Link as LinkIcon,
  Users,
  Eye,
  Trash2
} from "lucide-react";
import { Link } from "react-router-dom";

export default function MessageEditor() {
  const { id } = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const [showExitButton, setShowExitButton] = useState(false);

  const messages = [
    {
      id: 1,
      type: "welcome",
      title: "Mensagem de Boas-vindas",
      content: "Olá! 👋 Seja bem-vindo à nossa campanha Black Friday!\n\nVocê está prestes a descobrir ofertas EXCLUSIVAS com até 70% de desconto!\n\nEm breve você receberá nossas melhores promoções. Fique atento! 🔥",
      delay: 0,
      media: null,
      variables: ["nome", "email"],
      scheduled: false
    },
    {
      id: 2,
      type: "promotion",
      title: "Oferta Principal",
      content: "🚨 BLACK FRIDAY CHEGOU! 🚨\n\n{{nome}}, sua oferta EXCLUSIVA está aqui:\n\n✅ Curso Completo de Marketing Digital\n✅ 70% OFF (apenas hoje!)\n✅ Bônus exclusivos no valor de R$ 2.000\n\nAPENAS R$ 97 (era R$ 297)\n\n⏰ Restam apenas 6 horas!\n\nGarante já: {{link_checkout}}",
      delay: 60,
      media: "image",
      variables: ["nome", "link_checkout"],
      scheduled: true
    },
    {
      id: 3,
      type: "urgency",
      title: "Último Aviso",
      content: "⚠️ ÚLTIMA CHANCE! ⚠️\n\n{{nome}}, restam apenas 30 MINUTOS para aproveitar!\n\n🔥 70% OFF no Curso de Marketing Digital\n💰 Economia de R$ 200\n\nNão deixe para depois!\nEssa oferta expira em: ⏰ 30min\n\nGarante agora: {{link_checkout}}",
      delay: 300,
      media: null,
      variables: ["nome", "link_checkout"],
      scheduled: true
    }
  ];

  const handleSave = () => {
    setIsSaved(true);
    setShowExitButton(true);
  };

  const getDelayText = (delay: number) => {
    if (delay === 0) return "Imediata";
    if (delay < 60) return `${delay} minutos`;
    return `${Math.floor(delay / 60)}h ${delay % 60}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/messages">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Editor de Campanha</h1>
            <p className="text-muted-foreground">Campanha Black Friday</p>
          </div>
          <Badge variant="outline">Em Edição</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
          <Button variant="outline">
            <Send className="mr-2 h-4 w-4" />
            Testar Envio
          </Button>
          <Button onClick={handleSave} className={isSaved ? "bg-success" : ""}>
            <Save className="mr-2 h-4 w-4" />
            {isSaved ? "Salvo" : "Salvar"}
          </Button>
          {showExitButton && (
            <Link to="/messages">
              <Button variant="secondary">
                Sair do Projeto
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Flow */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-card-foreground">Fluxo de Mensagens</CardTitle>
                  <CardDescription>Configure a sequência de mensagens da campanha</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Mensagem
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {messages.map((message, index) => (
                <Card key={message.id} className="bg-muted/30 border-border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-card-foreground">{message.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            Envio: {getDelayText(message.delay)}
                            {message.scheduled && " (Agendado)"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {message.media && (
                          <Badge variant="outline" className="text-xs">
                            <Image className="mr-1 h-3 w-3" />
                            Mídia
                          </Badge>
                        )}
                        {message.scheduled && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            Agendado
                          </Badge>
                        )}
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Conteúdo da Mensagem</label>
                        <Textarea
                          value={message.content}
                          placeholder="Digite sua mensagem..."
                          rows={6}
                          className="mt-1 bg-input border-border text-sm"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Atraso (minutos)</label>
                          <Input
                            type="number"
                            value={message.delay}
                            className="mt-1 bg-input border-border"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Variáveis</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {message.variables.map((variable, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {`{{${variable}}}`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {message.media && (
                        <div className="p-2 border border-dashed border-border rounded text-center">
                          <Image className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">Clique para adicionar imagem</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Connection Lines */}
              {messages.length > 1 && (
                <div className="flex justify-center">
                  <div className="w-px h-6 bg-border"></div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Campaign Stats */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-card-foreground">1,250</p>
                <p className="text-sm text-muted-foreground">Destinatários</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mensagens no fluxo:</span>
                  <span className="font-medium text-card-foreground">{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duração estimada:</span>
                  <span className="font-medium text-card-foreground">5h 20m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxa de entrega:</span>
                  <span className="font-medium text-success">98.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-card-foreground">Lista de Contatos</label>
                <select className="w-full mt-1 p-2 rounded-md bg-input border border-border">
                  <option>Black Friday - Leads</option>
                  <option>Newsletter Subscribers</option>
                  <option>Clientes Ativos</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-card-foreground">Horário de Envio</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Input type="time" defaultValue="09:00" className="bg-input border-border" />
                  <Input type="time" defaultValue="18:00" className="bg-input border-border" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Mensagens entre 9h e 18h</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-card-foreground">Pausar em feriados</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-card-foreground">Respeitar opt-out</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Variables Helper */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Variáveis Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {["{{nome}}", "{{email}}", "{{telefone}}", "{{link_checkout}}", "{{link_descadastro}}"].map((variable, i) => (
                  <div key={i} className="flex items-center justify-between p-1 rounded hover:bg-muted/30">
                    <code className="text-xs bg-muted px-1 rounded">{variable}</code>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}