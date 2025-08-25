import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { authenticatedFetch, db } from '../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2 } from 'lucide-react';

export const SupabaseDemo: React.FC = () => {
  const { user, signIn, signUp, signOut, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [serverHealth, setServerHealth] = useState<any>(null);

  // Teste de conectividade com o servidor Express
  const checkServerHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setServerHealth(data);
    } catch (error) {
      console.error('Erro ao verificar saúde do servidor:', error);
      setServerHealth({ status: 'error', error: 'Servidor não responsivo' });
    }
  };

  // Buscar perfil via API do Express (híbrido)
  const fetchProfileViaExpress = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await authenticatedFetch('/api/users/profile');
      const data = await response.json();
      
      if (response.ok) {
        setProfile(data);
        setMessage('Perfil carregado via Express + Supabase');
      } else {
        setMessage(`Erro: ${data.error}`);
      }
    } catch (error) {
      setMessage('Erro ao carregar perfil via Express');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar dados diretamente do Supabase (frontend)
  const fetchDataDirectly = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Exemplo de consulta direta ao Supabase
      const { data, error } = await db.from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        setMessage(`Erro Supabase: ${error.message}`);
      } else {
        setMessage('Dados carregados diretamente do Supabase');
        console.log('Dados diretos:', data);
      }
    } catch (error) {
      setMessage('Erro ao acessar Supabase diretamente');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await signIn(email, password);
      setMessage('Login realizado com sucesso!');
    } catch (error: any) {
      setMessage(`Erro no login: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      await signUp(email, password);
      setMessage('Registro realizado com sucesso! Verifique seu email.');
    } catch (error: any) {
      setMessage(`Erro no registro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      setProfile(null);
      setMessage('Logout realizado com sucesso!');
    } catch (error: any) {
      setMessage(`Erro no logout: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkServerHealth();
  }, []);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Demonstração Supabase Híbrido</CardTitle>
          <CardDescription>
            Teste da integração entre Express + Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status do servidor */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">Status do Servidor:</h3>
            <Alert>
              <AlertDescription>
                {serverHealth ? (
                  <div>
                    <strong>Status:</strong> {serverHealth.status}<br/>
                    <strong>Supabase Configurado:</strong> {serverHealth.supabase_configured ? '✅ Sim' : '❌ Não'}<br/>
                    <strong>Ambiente:</strong> {serverHealth.environment}
                  </div>
                ) : (
                  'Verificando servidor...'
                )}
              </AlertDescription>
            </Alert>
          </div>

          {/* Status da autenticação */}
          <div className="mb-4">
            <h3 className="font-medium mb-2">Status da Autenticação:</h3>
            <Alert>
              <AlertDescription>
                {user ? (
                  <div>
                    <strong>Usuário:</strong> {user.email}<br/>
                    <strong>ID:</strong> {user.id}<br/>
                    <strong>Verificado:</strong> {user.email_confirmed_at ? '✅ Sim' : '❌ Não'}
                  </div>
                ) : (
                  'Usuário não autenticado'
                )}
              </AlertDescription>
            </Alert>
          </div>

          {!user ? (
            // Formulário de login/registro
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Login
                </Button>
                <Button type="button" variant="outline" onClick={handleRegister} disabled={loading}>
                  Registrar
                </Button>
              </div>
            </form>
          ) : (
            // Controles para usuário autenticado
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={fetchProfileViaExpress} disabled={loading}>
                  Buscar via Express
                </Button>
                <Button onClick={fetchDataDirectly} disabled={loading} variant="outline">
                  Buscar via Supabase Direto
                </Button>
                <Button onClick={handleLogout} disabled={loading} variant="destructive">
                  Logout
                </Button>
              </div>

              {/* Dados do perfil */}
              {profile && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Dados do Perfil:</h3>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                    {JSON.stringify(profile, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Mensagens */}
          {message && (
            <Alert className="mt-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
