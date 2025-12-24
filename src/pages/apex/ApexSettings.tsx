import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Lock, Camera, Save, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
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
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password validation
  const passwordValidation = useMemo(() => {
    const hasMinLength = passwordData.newPassword.length >= 6;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>\/\\]/.test(passwordData.newPassword);
    const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword.length > 0;
    const isDifferentFromCurrent = passwordData.currentPassword.length > 0 && passwordData.newPassword !== passwordData.currentPassword;
    return {
      hasMinLength,
      hasSpecialChar,
      passwordsMatch,
      isDifferentFromCurrent,
      isValid: hasMinLength && hasSpecialChar && passwordsMatch && isDifferentFromCurrent
    };
  }, [passwordData.newPassword, passwordData.confirmPassword, passwordData.currentPassword]);
  const tabs = [{
    id: "profile",
    label: "Perfil",
    icon: User
  }, {
    id: "security",
    label: "Segurança",
    icon: Lock
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
    if (!passwordValidation.isValid) {
      toast({
        title: "Erro",
        description: "A senha não atende aos requisitos mínimos",
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
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
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
                      <div className="relative">
                        <Input id="newPassword" type={showNewPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={passwordData.newPassword} onChange={e => setPasswordData(prev => ({
                          ...prev,
                          newPassword: e.target.value
                        }))} className="pr-10" />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <div className="relative">
                        <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirme a nova senha" value={passwordData.confirmPassword} onChange={e => setPasswordData(prev => ({
                          ...prev,
                          confirmPassword: e.target.value
                        }))} className="pr-10" />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Password validation feedback */}
                    {passwordData.newPassword.length > 0 && (
                      <Alert variant={passwordValidation.isValid ? "default" : "destructive"} className="py-3 border-secondary mb-4">
                        <AlertDescription className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            {passwordValidation.hasMinLength ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4" />}
                            <span className={passwordValidation.hasMinLength ? "text-green-500" : ""}>
                              Mínimo 6 caracteres
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {passwordValidation.hasSpecialChar ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4" />}
                            <span className={passwordValidation.hasSpecialChar ? "text-green-500" : ""}>
                              Um caractere especial (como /, @, etc)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {passwordValidation.passwordsMatch ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4" />}
                            <span className={passwordValidation.passwordsMatch ? "text-green-500" : ""}>
                              As senhas coincidem
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {passwordValidation.isDifferentFromCurrent ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4" />}
                            <span className={passwordValidation.isDifferentFromCurrent ? "text-green-500" : ""}>
                              A senha deve ser diferente da anterior
                            </span>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" disabled={loading || !passwordValidation.isValid}>
                      <Lock className="mr-2 h-4 w-4" />
                      {loading ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

            </>}


        </div>
      </div>
    </div>;
}