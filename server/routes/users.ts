import { RequestHandler } from "express";
import { supabaseAdmin, supabasePublic } from "../lib/supabase";

// Rota para obter perfil do usuário atual
export const getProfileHandler: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Usuário não autenticado",
        code: "NOT_AUTHENTICATED",
      });
    }

    // Buscar dados adicionais do perfil na tabela profiles (se existir)
    const { data: profile, error } = await supabasePublic
      .from("profiles")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = row not found
      console.error("Erro ao buscar perfil:", error);
      return res.status(500).json({
        error: "Erro ao buscar perfil",
        code: "PROFILE_FETCH_ERROR",
      });
    }

    res.json({
      user: req.user,
      profile: profile || null,
    });
  } catch (error) {
    console.error("Erro no handler de perfil:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  }
};

// Rota para atualizar perfil (lógica híbrida - validação no Express + save no Supabase)
export const updateProfileHandler: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Usuário não autenticado",
        code: "NOT_AUTHENTICATED",
      });
    }

    const { full_name, avatar_url, bio, phone } = req.body;

    // Validações de negócio no Express
    if (full_name && full_name.length < 2) {
      return res.status(400).json({
        error: "Nome deve ter pelo menos 2 caracteres",
        code: "INVALID_NAME",
      });
    }

    if (bio && bio.length > 500) {
      return res.status(400).json({
        error: "Bio deve ter no máximo 500 caracteres",
        code: "BIO_TOO_LONG",
      });
    }

    // Atualizar no Supabase
    const { data, error } = await supabasePublic
      .from("profiles")
      .upsert({
        id: req.user.id,
        full_name,
        avatar_url,
        bio,
        phone,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar perfil:", error);
      return res.status(500).json({
        error: "Erro ao atualizar perfil",
        code: "PROFILE_UPDATE_ERROR",
      });
    }

    res.json({
      message: "Perfil atualizado com sucesso",
      profile: data,
    });
  } catch (error) {
    console.error("Erro no handler de atualização:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  }
};

// Rota administrativa - listar usuários (apenas admin)
export const listUsersHandler: RequestHandler = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        error: "Acesso negado - apenas administradores",
        code: "ACCESS_DENIED",
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Usando cliente admin para operações administrativas
    const {
      data: users,
      error,
      count,
    } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email, created_at, updated_at", {
        count: "exact",
      })
      .range(offset, offset + Number(limit) - 1)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao listar usuários:", error);
      return res.status(500).json({
        error: "Erro ao listar usuários",
        code: "USERS_FETCH_ERROR",
      });
    }

    res.json({
      users: users || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Erro no handler de listagem:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  }
};

// Rota complexa - análise de dados do usuário
export const getUserAnalyticsHandler: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Usuário não autenticado",
        code: "NOT_AUTHENTICATED",
      });
    }

    // Exemplo de lógica complexa que combina múltiplas consultas
    const [profileResult, activitiesResult, routesResult] = await Promise.all([
      supabasePublic
        .from("profiles")
        .select("*")
        .eq("id", req.user.id)
        .single(),
      supabasePublic
        .from("activities")
        .select("*")
        .eq("user_id", req.user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabasePublic.from("routes").select("*").eq("user_id", req.user.id),
    ]);

    // Processamento de dados no Express
    const analytics = {
      profile: profileResult.data,
      recent_activities: activitiesResult.data || [],
      total_routes: routesResult.data?.length || 0,
      last_activity: activitiesResult.data?.[0]?.created_at || null,
      // Mais lógica de análise aqui...
    };

    res.json(analytics);
  } catch (error) {
    console.error("Erro no handler de analytics:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      code: "INTERNAL_ERROR",
    });
  }
};
