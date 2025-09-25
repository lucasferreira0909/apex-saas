import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import apexLogo from "@/assets/apex-logo-new.png";
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
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
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Login realizado com sucesso!");
          navigate("/");
        }
      } else {
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
          toast.success("Conta criada com sucesso! Verifique seu email.");
        }
      }
    } catch (error) {
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
              <Input id="password" type="password" placeholder="Sua senha" value={password} onChange={e => setPassword(e.target.value)} required />
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