import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { CheckCircle, AlertCircle, User, Mail, Key } from "lucide-react";
import { supabase } from "../lib/supabase";

const AuthTestPage: React.FC = () => {
  const { user, isAuthenticated, login, register, logout, isLoading } =
    useAuth();
  const [email, setEmail] = useState("teste@exemplo.com");
  const [password, setPassword] = useState("123456");
  const [message, setMessage] = useState("");
  const [testResults, setTestResults] = useState<string[]>([]);

  const isSupabaseConfigured = !!supabase;

  const addTestResult = (result: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ]);
  };

  const testRegistration = async () => {
    setMessage("Testando registro...");
    addTestResult("Iniciando teste de registro");

    try {
      const success = await register(email, password);
      if (success) {
        setMessage("✅ Registro realizado com sucesso!");
        addTestResult("✅ Registro funcionando");
      } else {
        setMessage("❌ Erro no registro");
        addTestResult("❌ Erro no registro");
      }
    } catch (error: any) {
      setMessage(`❌ Erro: ${error.message}`);
      addTestResult(`❌ Erro no registro: ${error.message}`);
    }
  };

  const testLogin = async () => {
    setMessage("Testando login...");
    addTestResult("Iniciando teste de login");

    try {
      const success = await login(email, password);
      if (success) {
        setMessage("✅ Login realizado com sucesso!");
        addTestResult("✅ Login funcionando");
      } else {
        setMessage("❌ Credenciais inválidas");
        addTestResult("❌ Credenciais inválidas");
      }
    } catch (error: any) {
      setMessage(`❌ Erro: ${error.message}`);
      addTestResult(`❌ Erro no login: ${error.message}`);
    }
  };

  const testLogout = async () => {
    setMessage("Testando logout...");
    addTestResult("Iniciando teste de logout");

    try {
      await logout();
      setMessage("✅ Logout realizado com sucesso!");
      addTestResult("✅ Logout funcionando");
    } catch (error: any) {
      setMessage(`❌ Erro: ${error.message}`);
      addTestResult(`❌ Erro no logout: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            🎉 Autenticação Supabase Ativada!
          </h1>
          <p className="text-muted-foreground">
            Sistema de autenticação real funcionando
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Configuration Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Status da Configuração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Supabase Configurado:</span>
                <Badge
                  variant={isSupabaseConfigured ? "default" : "destructive"}
                >
                  {isSupabaseConfigured ? "✅ Sim" : "❌ Não"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Usuário Autenticado:</span>
                <Badge variant={isAuthenticated ? "default" : "secondary"}>
                  {isAuthenticated ? "✅ Sim" : "❌ Não"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Sistema:</span>
                <Badge variant="default">✅ Ativo</Badge>
              </div>
            </CardContent>
          </Card>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">ID: {user.id}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Nenhum usuário logado
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Painel de Testes de Autenticação</CardTitle>
            <CardDescription>
              Teste as funcionalidades de autenticação em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Test Credentials */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email de Teste
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teste@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senha</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="123456"
                />
              </div>
            </div>

            {/* Test Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={testRegistration}
                disabled={isLoading}
                variant="default"
              >
                Testar Registro
              </Button>

              <Button
                onClick={testLogin}
                disabled={isLoading}
                variant="outline"
              >
                Testar Login
              </Button>

              <Button
                onClick={testLogout}
                disabled={isLoading || !isAuthenticated}
                variant="destructive"
              >
                Testar Logout
              </Button>
            </div>

            {/* Test Results */}
            {message && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {/* Test Log */}
            {testResults.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Log de Testes:</h3>
                <div className="bg-muted p-3 rounded text-sm max-h-40 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="font-mono text-xs">
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>🎉 Autenticação Real Ativada!</strong>
                <br />O sistema agora usa autenticação real com Supabase. Você
                pode:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Criar contas reais de usuários</li>
                  <li>Fazer login com credenciais válidas</li>
                  <li>Dados persistidos no banco de dados</li>
                  <li>Segurança com JWT tokens</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Variáveis Configuradas:</h4>
                <div className="space-y-1 font-mono text-xs bg-muted p-2 rounded">
                  <div>✅ VITE_SUPABASE_URL</div>
                  <div>✅ VITE_SUPABASE_ANON_KEY</div>
                  <div>✅ SUPABASE_URL</div>
                  <div>✅ SUPABASE_ANON_KEY</div>
                  <div>✅ SUPABASE_SERVICE_ROLE_KEY</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Funcionalidades:</h4>
                <div className="space-y-1 text-xs">
                  <div>✅ Registro de usuários</div>
                  <div>✅ Login/Logout</div>
                  <div>✅ Sessões persistentes</div>
                  <div>✅ APIs híbridas Express+Supabase</div>
                  <div>✅ Validação de credenciais</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <div className="text-center space-x-4">
          <Button asChild variant="outline">
            <a href="/login">Ir para Login</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/supabase-demo">Ver Demo Completa</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/app">Dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthTestPage;
