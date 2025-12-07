import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Lock, Camera, Save, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
export default function ApexSettings() {
  const navigate = useNavigate();
  const {
    profile,
    updateProfile
  } = useAuth();
  const {
    uploadImage,
    uploading
  } = useImageUpload();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tabs = [{
    id: "profile",
    label: "Perfil",
    icon: User
  }, {
    id: "security",
    label: "Segurança",
    icon: Lock
  }, {
    id: "plans",
    label: "Planos",
    icon: CreditCard
  }];
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const {
      url,
      error
    } = await uploadImage(file, {
      bucket: 'avatars',
      maxSizeMB: 2
    });
    if (error) {
      toast({
        title: "Erro",
        description: error,
        variant: "destructive"
      });
      return;
    }
    if (url) {
      const {
        error: updateError
      } = await updateProfile({
        avatar_url: url
      });
      if (updateError) {
        toast({
          title: "Erro",
          description: "Erro ao atualizar avatar",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Avatar atualizado com sucesso!"
        });
      }
    }
  };
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const updates = {
      first_name: formData.get('firstName') as string,
      last_name: formData.get('lastName') as string,
      phone: formData.get('phone') as string
    };
    const {
      error
    } = await updateProfile(updates);
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil: " + error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      });
    }
    setLoading(false);
  };
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    const {
      error
    } = await supabase.auth.updateUser({
      password: passwordData.newPassword
    });
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar senha: " + error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!"
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setLoading(false);
  };
  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (profile?.email) {
      return profile.email[0].toUpperCase();
    }
    return 'U';
  };
  return <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Minha Conta</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e configurações</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Menu */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-2">
              {tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-card-foreground hover:bg-muted"}`}>
                  <tab.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>)}
            </nav>
          </CardContent>
        </Card>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === "profile" && <>
              {/* Profile Picture */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Foto de Perfil</CardTitle>
                  <CardDescription>Atualize sua imagem de perfil</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        <Camera className="mr-2 h-4 w-4" />
                        {uploading ? 'Enviando...' : 'Alterar Foto'}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG ou GIF. Máximo 2MB.
                      </p>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Info */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Informações Pessoais</CardTitle>
                  <CardDescription>Atualize seus dados pessoais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleProfileUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nome</Label>
                        <Input id="firstName" name="firstName" placeholder="Seu nome" defaultValue={profile?.first_name || ''} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Sobrenome</Label>
                        <Input id="lastName" name="lastName" placeholder="Seu sobrenome" defaultValue={profile?.last_name || ''} />
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="seu@email.com" value={profile?.email || ''} disabled className="bg-muted text-muted-foreground cursor-not-allowed" title="Email não pode ser alterado" />
                    </div>
                    
                    <Button type="submit" disabled={loading}>
                      <Save className="mr-2 h-4 w-4" />
                      {loading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>}

          {activeTab === "security" && <>
              {/* Change Password */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Alterar Senha</CardTitle>
                  <CardDescription>Mantenha sua conta segura com uma senha forte</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handlePasswordChange}>
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <Input id="currentPassword" type="password" placeholder="Digite sua senha atual" value={passwordData.currentPassword} onChange={e => setPasswordData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))} />
                    </div>
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input id="newPassword" type="password" placeholder="Mínimo 6 caracteres" value={passwordData.newPassword} onChange={e => setPasswordData(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))} />
                    </div>
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <Input id="confirmPassword" type="password" placeholder="Confirme a nova senha" value={passwordData.confirmPassword} onChange={e => setPasswordData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))} />
                    </div>
                    <Button type="submit" disabled={loading || !passwordData.newPassword || !passwordData.confirmPassword}>
                      <Lock className="mr-2 h-4 w-4" />
                      {loading ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

            </>}

          {activeTab === "plans" && <>
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
            </>}

        </div>
      </div>
    </div>;
}