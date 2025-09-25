import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, Lock, Trash2, Camera, Save, AlertTriangle, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
export default function ApexSettings() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const { uploadImage, uploading } = useImageUpload();
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
    id: "account",
    label: "Conta",
    icon: Trash2
  }];

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const { url, error } = await uploadImage(file, {
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
      const { error: updateError } = await updateProfile({ avatar_url: url });
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
      phone: formData.get('phone') as string,
    };

    const { error } = await updateProfile(updates);
    
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
    
    const { error } = await supabase.auth.updateUser({
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
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
    
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      
      // Chama a edge function para excluir a conta
      const { data, error } = await supabase.functions.invoke('delete-account');
      
      if (error) {
        throw error;
      }

      // Exibe mensagem de sucesso
      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso.",
      });

      // Redireciona para a página de login
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir conta: " + (error.message || "Erro desconhecido"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e configurações de conta</p>
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        {uploading ? 'Enviando...' : 'Alterar Foto'}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG ou GIF. Máximo 2MB.
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
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
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="seu@email.com" 
                        value={profile?.email || ''} 
                        disabled 
                        className="bg-muted text-muted-foreground cursor-not-allowed"
                        title="Email não pode ser alterado"
                      />
                    </div>
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input id="phone" name="phone" placeholder="(11) 99999-9999" defaultValue={profile?.phone || ''} />
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
                      <Input 
                        id="currentPassword" 
                        type="password" 
                        placeholder="Digite sua senha atual"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input 
                        id="newPassword" 
                        type="password" 
                        placeholder="Mínimo 6 caracteres"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        placeholder="Confirme a nova senha"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                    </div>
                    <Button type="submit" disabled={loading || !passwordData.newPassword || !passwordData.confirmPassword}>
                      <Lock className="mr-2 h-4 w-4" />
                      {loading ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Security Status */}
              
            </>}

          {activeTab === "account" && <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                <CardDescription>Ações irreversíveis da conta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-1" />
                    <div className="flex-1">
                      <h3 className="font-medium text-destructive">Excluir Conta</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Esta ação não pode ser desfeita. Todos os seus dados, projetos e configurações serão permanentemente removidos.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="mt-3" disabled={loading}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir Minha Conta
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão de Conta</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza de que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão permanentemente removidos.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={handleDeleteAccount}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir Conta
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>}
        </div>
      </div>
    </div>;
}