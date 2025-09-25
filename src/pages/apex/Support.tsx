import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mail, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
export default function Support() {
  const {
    user,
    loading
  } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "media"
  });
  const tickets = [{
    id: "#APEX-001",
    subject: "Erro ao salvar funil",
    status: "Em Andamento",
    created: "2h atrás",
    priority: "Alta"
  }, {
    id: "#APEX-002",
    subject: "Dúvida sobre disparos WhatsApp",
    status: "Resolvido",
    created: "1d atrás",
    priority: "Média"
  }];
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmitTicket = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para enviar um ticket");
      return;
    }
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    setIsSubmitting(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('send-support-ticket', {
        body: {
          subject: formData.subject,
          description: formData.description,
          priority: formData.priority
        }
      });
      if (error) {
        console.error('Error sending support ticket:', error);
        toast.error("Erro ao enviar ticket: " + error.message);
        return;
      }
      if (data?.success) {
        toast.success(`Ticket ${data.ticketId} enviado com sucesso!`);
        setFormData({
          subject: "",
          description: "",
          priority: "media"
        });
      } else {
        toast.error("Erro ao enviar ticket. Tente novamente.");
      }
    } catch (error: any) {
      console.error('Error submitting support ticket:', error);
      toast.error("Erro ao enviar ticket: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleMailtoFallback = () => {
    const subject = encodeURIComponent(formData.subject || "Solicitação de Suporte Apex");
    const body = encodeURIComponent(`Descrição: ${formData.description}\n\nPrioridade: ${formData.priority}\n\nUsuário: ${user?.email}`);
    window.open(`mailto:apex.suporte.br@gmail.com?subject=${subject}&body=${body}`, '_blank');
  };
  return <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Suporte</h1>
        <p className="text-muted-foreground">Estamos aqui para ajudar você com qualquer dúvida</p>
      </div>

      {/* Comunidade Apex */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center">
            <MessageCircle className="mr-2 h-5 w-5 text-primary" />
            Comunidade Apex
          </CardTitle>
          <CardDescription>Conecte-se com outros usuários e nossa equipe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Junte-se à nossa comunidade no WhatsApp para receber suporte rápido, 
              dicas exclusivas e se conectar com outros usuários do Apex.
            </p>
            <Button onClick={() => window.open('https://chat.whatsapp.com/BLwCE0mb7nX1tZXxiOMKA2', '_blank')} className="w-full">
              <MessageCircle className="mr-2 h-4 w-4" />
              Entrar na Comunidade WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-0">
        {/* New Ticket */}
        

        {/* My Tickets */}
        
      </div>

      {/* Contact Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Resolução de problemas</CardTitle>
          <CardDescription>Canais alternativos para suporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-card-foreground">Email</p>
                <p className="text-sm text-muted-foreground">apex.suporte.br@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-card-foreground">Telefone</p>
                <p className="text-sm text-muted-foreground">(11) 915722726</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
}