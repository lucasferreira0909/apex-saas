import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Lock, Camera, Save, Shield, AlertTriangle, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Enhanced security validation schemas
const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Nome é obrigatório").max(50, "Nome muito longo"),
  lastName: z.string().trim().min(1, "Sobrenome é obrigatório").max(50, "Sobrenome muito longo"),
  phone: z.string().trim().min(10, "Telefone deve ter pelo menos 10 dígitos").max(20, "Telefone muito longo")
});

const passwordSchema = z.object({
  newPassword: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});
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
  const [passwordStrength, setPasswordStrength] = useState<string>("");
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password strength indicator and checklist
  const checkPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) {
      setPasswordStrength("");
      setPasswordChecks({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      });
      return;
    }
    
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd)
    };
    
    setPasswordChecks(checks);
    
    let strength = 0;
    if (checks.length) strength++;
    if (checks.uppercase) strength++;
    if (checks.lowercase) strength++;
    if (checks.number) strength++;
    if (checks.special) strength++;
    
    const levels = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];
    setPasswordStrength(levels[strength - 1] || "Muito fraca");
  };
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
    const formFields = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      phone: formData.get('phone') as string,
    };

    // Validate input data
    const validation = profileSchema.safeParse(formFields);
    if (!validation.success) {
      toast({
        title: "Erro de Validação",
        description: validation.error.errors[0].message,
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    const updates = {
      first_name: formFields.firstName.trim(),
      last_name: formFields.lastName.trim(),
      phone: formFields.phone.trim(),
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
    
    // Validate password data
    const validation = passwordSchema.safeParse({
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword
    });
    
    if (!validation.success) {
      toast({
        title: "Erro de Validação",
        description: validation.error.errors[0].message,
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
        description: "Senha alterada com sucesso! Por segurança, você será redirecionado para fazer login novamente."
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
      // Log out user after password change for security
      setTimeout(() => {
        supabase.auth.signOut();
        navigate("/auth");
      }, 2000);
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
                        placeholder="Mínimo 8 caracteres com maiúscula, minúscula, número e símbolo"
                        value={passwordData.newPassword}
                        onChange={(e) => {
                          setPasswordData(prev => ({ ...prev, newPassword: e.target.value }));
                          checkPasswordStrength(e.target.value);
                        }}
                      />
                      {passwordData.newPassword && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Força da senha: </span>
                          <span className={
                            passwordStrength === "Forte" ? "text-green-600" :
                            passwordStrength === "Boa" ? "text-blue-600" :
                            passwordStrength === "Razoável" ? "text-yellow-600" :
                            "text-red-600"
                          }>
                            {passwordStrength}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {passwordData.newPassword && (
                      <Card className="bg-muted/30 border-muted mb-4">
                        <CardContent className="p-4">
                          <p className="text-sm font-medium text-muted-foreground mb-3">
                            Sua nova senha deve conter:
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              {passwordChecks.length ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                              <span className={passwordChecks.length ? "text-green-600" : "text-muted-foreground"}>
                                Pelo menos 8 caracteres
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              {passwordChecks.uppercase ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                              <span className={passwordChecks.uppercase ? "text-green-600" : "text-muted-foreground"}>
                                Uma letra maiúscula (A-Z)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              {passwordChecks.lowercase ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                              <span className={passwordChecks.lowercase ? "text-green-600" : "text-muted-foreground"}>
                                Uma letra minúscula (a-z)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              {passwordChecks.number ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                              <span className={passwordChecks.number ? "text-green-600" : "text-muted-foreground"}>
                                Um número (0-9)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              {passwordChecks.special ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                              <span className={passwordChecks.special ? "text-green-600" : "text-muted-foreground"}>
                                Um caractere especial (!@#$%^&*)
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-2 mb-4">
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
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Status de Segurança
                  </CardTitle>
                  <CardDescription>Configurações de segurança da sua conta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">Proteção contra senhas vazadas</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">Recomendado ativar no painel do Supabase</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-yellow-700 border-yellow-300 dark:text-yellow-300">
                      Pendente
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">Validação de senha forte</p>
                        <p className="text-sm text-green-700 dark:text-green-300">Senhas são validadas com critérios rigorosos</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-700 border-green-300 dark:text-green-300">
                      Ativo
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800 dark:text-green-200">Proteção RLS ativa</p>
                        <p className="text-sm text-green-700 dark:text-green-300">Dados protegidos por políticas de segurança</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-700 border-green-300 dark:text-green-300">
                      Ativo
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              
            </>}

        </div>
      </div>
    </div>;
}