import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Login() {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle, isLoading } = useAuth();

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(loginEmail, loginPassword);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupPassword !== signupConfirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    try {
      await signup(signupName, signupEmail, signupPassword);
      navigate("/");
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-finsync-accent">Fin</span>
            <span className="text-finsync-dark">Sync</span>
          </h1>
          <p className="text-zinc-500 mt-2">
            Sua gestão financeira simplificada
          </p>
        </div>

        <Tabs
          defaultValue="login"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Bem-vindo de volta</CardTitle>
                <CardDescription>
                  Entre com seu e-mail e senha para acessar sua conta
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                      <a
                        href="#"
                        className="text-xs text-finsync-primary hover:underline"
                      >
                        Esqueceu a senha?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-finsync-primary hover:bg-finsync-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={loginWithGoogle}
                    disabled={isLoading}
                  >
                    {isLoading ? "Conectando..." : "Entrar com Google"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Crie sua conta</CardTitle>
                <CardDescription>
                  Comece a organizar suas finanças hoje mesmo
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      placeholder="Nome completo"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-finsync-primary hover:bg-finsync-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando conta..." : "Criar conta"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={loginWithGoogle}
                    disabled={isLoading}
                  >
                    {isLoading ? "Conectando..." : "Cadastrar com Google"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm text-zinc-500">
          <p>
            {activeTab === "login"
              ? "Não tem uma conta? "
              : "Já tem uma conta? "}
            <button
              className="text-finsync-primary hover:underline font-medium"
              onClick={() =>
                setActiveTab(activeTab === "login" ? "signup" : "login")
              }
            >
              {activeTab === "login" ? "Cadastre-se" : "Entre"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
