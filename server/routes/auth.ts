import { RequestHandler } from 'express';
import { supabasePublic } from '../lib/supabase';

// Rota para login com email/senha
export const loginHandler: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const { data, error } = await supabasePublic.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    res.json({
      user: data.user,
      session: data.session,
      access_token: data.session?.access_token
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Rota para registro
export const registerHandler: RequestHandler = async (req, res) => {
  try {
    const { email, password, metadata } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const { data, error } = await supabasePublic.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {}
      }
    });

    if (error) {
      return res.status(400).json({
        error: error.message,
        code: 'SIGNUP_ERROR'
      });
    }

    res.status(201).json({
      user: data.user,
      session: data.session,
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Rota para logout
export const logoutHandler: RequestHandler = async (req, res) => {
  try {
    // O logout é tratado principalmente no frontend
    // Esta rota pode ser usada para limpeza adicional no servidor
    
    res.json({
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Rota para verificar status de autenticação
export const authStatusHandler: RequestHandler = async (req, res) => {
  if (req.user) {
    res.json({
      authenticated: true,
      user: req.user
    });
  } else {
    res.json({
      authenticated: false,
      user: null
    });
  }
};
