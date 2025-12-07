import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import apexLogo from "@/assets/apex-logo-auth.png";
const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();
  }, [navigate]);

  // Password validation
  const passwordValidation = useMemo(() => {
    const hasMinLength = password.length >= 6;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>\/\\]/.test(password);
    return {
      hasMinLength,
      hasSpecialChar,
      isValid: hasMinLength && hasSpecialChar
    };
  }, [password]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        toast.error(error.message);
      } else {
        // Set flag to show post-login loading screen
        sessionStorage.setItem("apex_fresh_login", "true");
        toast.success("Login realizado com sucesso!");
        navigate("/");
      }
    } catch (error) {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation.isValid) {
      toast.error("A senha não atende aos requisitos mínimos.");
      return;
    }
    
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            phone: phone,
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      if (error) {
        toast.error(error.message);
      } else {
        // Set flag to show post-login loading screen for signup too
        sessionStorage.setItem("apex_fresh_login", "true");
        toast.success("Conta criada com sucesso!");
        navigate("/");
      }
    } catch (error) {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setPhone("");
    setFirstName("");
    setLastName("");
  };
  return <div className="min-h-screen flex items-center justify-center bg-background p-4 dark">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-1">
            <img src={apexLogo} alt="Apex Logo" className="h-14 w-auto" />
          </div>
          <CardDescription>
            Acesse sua conta ou crie uma nova
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full" onValueChange={resetForm}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input id="login-password" type="password" placeholder="Sua senha" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Carregando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input id="firstName" type="text" placeholder="Seu nome" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
                
                
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input id="signup-password" type="password" placeholder="Sua senha" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>

                {/* Password validation feedback */}
                {password.length > 0 && (
                  <Alert variant={passwordValidation.isValid ? "default" : "destructive"} className="py-3">
                    <AlertDescription className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {passwordValidation.hasMinLength ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span className={passwordValidation.hasMinLength ? "text-green-500" : ""}>
                          Mínimo 6 caracteres
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordValidation.hasSpecialChar ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span className={passwordValidation.hasSpecialChar ? "text-green-500" : ""}>
                          Um caractere especial (como /, @, etc)
                        </span>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading || !passwordValidation.isValid}>
                  {loading ? "Carregando..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
};
export default Auth;