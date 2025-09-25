import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import apexLogo from "@/assets/apex-logo-new.png";

// Enhanced password validation schema
const passwordSchema = z.string()
  .min(8, "Senha deve ter pelo menos 8 caracteres")
  .regex(/[A-Z]/, "Senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "Senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "Senha deve conter pelo menos um número")
  .regex(/[^A-Za-z0-9]/, "Senha deve conter pelo menos um caractere especial");

const signUpSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  password: passwordSchema,
  firstName: z.string().trim().min(1, "Nome é obrigatório").max(50, "Nome muito longo"),
  lastName: z.string().trim().min(1, "Sobrenome é obrigatório").max(50, "Sobrenome muito longo"),
  phone: z.string().trim().min(10, "Telefone deve ter pelo menos 10 dígitos").max(20, "Telefone muito longo")
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória")
});
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string>("");
  const [lastAttempt, setLastAttempt] = useState<number>(0);
  const navigate = useNavigate();

  // Password strength indicator
  const checkPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) {
      setPasswordStrength("");
      return;
    }
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    
    const levels = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];
    setPasswordStrength(levels[strength - 1] || "Muito fraca");
  };
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
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic rate limiting - prevent rapid attempts
    const now = Date.now();
    if (now - lastAttempt < 2000) {
      toast.error("Aguarde alguns segundos antes de tentar novamente.");
      return;
    }
    setLastAttempt(now);
    
    setLoading(true);
    
    try {
      if (isLogin) {
        // Validate login data
        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setLoading(false);
          return;
        }
        
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        
        if (error) {
          // More specific error messages for common auth errors
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou senha incorretos.");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("Por favor, confirme seu email antes de fazer login.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Login realizado com sucesso!");
          navigate("/");
        }
      } else {
        // Validate sign up data
        const validation = signUpSchema.safeParse({ 
          email, 
          password, 
          firstName, 
          lastName, 
          phone 
        });
        
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setLoading(false);
          return;
        }
        
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              phone: phone.trim(),
              first_name: firstName.trim(),
              last_name: lastName.trim()
            }
          }
        });
        
        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("Este email já está cadastrado. Tente fazer login.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Conta criada com sucesso! Verifique seu email para confirmar.");
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-background p-4 dark">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-1">
            <img src={apexLogo} alt="Apex Logo" className="h-16 w-auto" />
          </div>
          
          <CardDescription>
            {isLogin ? "Entre com suas credenciais para acessar sua conta" : "Crie sua conta para começar a usar a Apex"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input id="firstName" type="text" placeholder="Seu nome" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input id="lastName" type="text" placeholder="Seu sobrenome" value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
              </>}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder={isLogin ? "Sua senha" : "Mínimo 8 caracteres com maiúscula, minúscula, número e símbolo"} 
                value={password} 
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (!isLogin) {
                    checkPasswordStrength(e.target.value);
                  }
                }} 
                required 
              />
              {!isLogin && password && (
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

            {!isLogin && <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" type="tel" placeholder="(11) 99999-9999" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => setIsLogin(!isLogin)} className="text-sm">
              {isLogin ? "Não tem conta? Criar uma conta" : "Já tem conta? Fazer login"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default Auth;