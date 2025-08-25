const express = require("express");
const { query } = require("../utils/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

/**
 * GET /api/dashboard/stats
 * Estatísticas gerais do usuário para o dashboard
 */
router.get("/stats", async (req, res) => {
  try {
    const userId = req.user.id;
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    // Buscar estatísticas do mês atual
    const statsQuery = `
      WITH route_stats AS (
        SELECT 
          COUNT(*) as total_routes,
          COUNT(CASE WHEN DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as routes_this_month,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_routes
        FROM routes 
        WHERE user_id = $1 AND deleted_at IS NULL
      ),
      navigation_stats AS (
        SELECT 
          COALESCE(SUM(total_time), 0) as total_time_minutes,
          COALESCE(SUM(total_distance), 0) as total_distance_meters,
          COALESCE(AVG(efficiency_score), 0) as avg_efficiency,
          COUNT(*) as total_navigations
        FROM route_metrics rm
        JOIN routes r ON rm.route_id = r.id
        WHERE r.user_id = $1 
          AND rm.created_at >= DATE_TRUNC('month', CURRENT_DATE)
      ),
      time_savings AS (
        SELECT 
          COALESCE(SUM(estimated_time_saved), 0) as time_saved_minutes
        FROM route_metrics rm
        JOIN routes r ON rm.route_id = r.id
        WHERE r.user_id = $1 
          AND rm.created_at >= DATE_TRUNC('month', CURRENT_DATE)
      ),
      plan_usage AS (
        SELECT 
          up.max_routes_monthly,
          up.max_immediate_routes,
          up.max_route_sets,
          up.max_clients
        FROM user_preferences up
        WHERE up.user_id = $1
      )
      SELECT 
        rs.total_routes,
        rs.routes_this_month,
        rs.completed_routes,
        ns.total_time_minutes,
        ns.total_distance_meters,
        ns.avg_efficiency,
        ns.total_navigations,
        ts.time_saved_minutes,
        pu.max_routes_monthly,
        pu.max_immediate_routes,
        pu.max_route_sets,
        pu.max_clients
      FROM route_stats rs
      CROSS JOIN navigation_stats ns
      CROSS JOIN time_savings ts
      CROSS JOIN plan_usage pu
    `;

    const result = await query(statsQuery, [userId]);
    const stats = result.rows[0];

    // Calcular mudanças percentuais (simulado para este mês vs mês anterior)
    const lastMonthQuery = `
      SELECT 
        COUNT(*) as routes_last_month
      FROM routes 
      WHERE user_id = $1 
        AND deleted_at IS NULL
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
    `;
    
    const lastMonthResult = await query(lastMonthQuery, [userId]);
    const lastMonthRoutes = lastMonthResult.rows[0]?.routes_last_month || 0;
    
    const routeChange = lastMonthRoutes > 0 
      ? Math.round(((stats.routes_this_month - lastMonthRoutes) / lastMonthRoutes) * 100)
      : stats.routes_this_month > 0 ? 100 : 0;

    // Formatar resposta
    const response = {
      routes: {
        total: parseInt(stats.total_routes) || 0,
        thisMonth: parseInt(stats.routes_this_month) || 0,
        completed: parseInt(stats.completed_routes) || 0,
        change: `${routeChange >= 0 ? '+' : ''}${routeChange}%`
      },
      timeSaved: {
        totalMinutes: parseFloat(stats.time_saved_minutes) || 0,
        totalHours: Math.round((parseFloat(stats.time_saved_minutes) || 0) / 60 * 10) / 10,
        change: "+18%", // Simulated - could be calculated from previous months
        formatted: `${Math.round((parseFloat(stats.time_saved_minutes) || 0) / 60 * 10) / 10}h`
      },
      distance: {
        totalMeters: parseInt(stats.total_distance_meters) || 0,
        totalKm: Math.round((parseInt(stats.total_distance_meters) || 0) / 1000 * 10) / 10,
        change: "+8%", // Simulated
        formatted: `${Math.round((parseInt(stats.total_distance_meters) || 0) / 1000)}km`
      },
      efficiency: {
        average: Math.round(parseFloat(stats.avg_efficiency) || 89),
        change: "+5%", // Simulated
        formatted: `${Math.round(parseFloat(stats.avg_efficiency) || 89)}%`
      },
      usage: {
        routes: {
          current: parseInt(stats.routes_this_month) || 0,
          limit: parseInt(stats.max_routes_monthly) || 100,
          percentage: Math.round(((parseInt(stats.routes_this_month) || 0) / (parseInt(stats.max_routes_monthly) || 100)) * 100)
        },
        clients: {
          current: 0, // Will be calculated separately
          limit: parseInt(stats.max_clients) || 500,
          percentage: 0
        }
      }
    };

    // Buscar contagem de clientes
    const clientsQuery = `
      SELECT COUNT(*) as client_count
      FROM clients
      WHERE user_id = $1 AND deleted_at IS NULL
    `;
    
    const clientsResult = await query(clientsQuery, [userId]);
    const clientCount = parseInt(clientsResult.rows[0]?.client_count) || 0;
    
    response.usage.clients.current = clientCount;
    response.usage.clients.percentage = Math.round((clientCount / response.usage.clients.limit) * 100);

    res.json(response);
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/dashboard/recent-routes
 * Rotas recentes do usuário
 */
router.get("/recent-routes", async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 5 } = req.query;

    const routesQuery = `
      SELECT 
        r.id,
        r.name,
        r.status,
        r.estimated_duration,
        r.estimated_distance,
        r.created_at,
        r.updated_at,
        COUNT(rs.id) as stop_count,
        rm.total_time as actual_duration,
        rm.total_distance as actual_distance,
        rm.time_saved as time_savings
      FROM routes r
      LEFT JOIN route_stops rs ON r.id = rs.route_id
      LEFT JOIN route_metrics rm ON r.id = rm.route_id
      WHERE r.user_id = $1 AND r.deleted_at IS NULL
      GROUP BY r.id, rm.total_time, rm.total_distance, rm.time_saved
      ORDER BY r.updated_at DESC
      LIMIT $2
    `;

    const result = await query(routesQuery, [userId, parseInt(limit)]);
    
    const routes = result.rows.map(route => ({
      id: route.id,
      name: route.name,
      status: route.status,
      stopCount: parseInt(route.stop_count) || 0,
      duration: route.actual_duration 
        ? `${Math.round(route.actual_duration / 60)} min`
        : route.estimated_duration || "N/A",
      distance: route.actual_distance 
        ? `${Math.round(route.actual_distance / 1000 * 10) / 10} km`
        : route.estimated_distance ? `${Math.round(route.estimated_distance / 1000 * 10) / 10} km` : "N/A",
      savings: route.time_savings 
        ? `${Math.round(route.time_savings / 60)} min`
        : null,
      time: route.updated_at,
      createdAt: route.created_at
    }));

    res.json(routes);
  } catch (error) {
    console.error("Erro ao buscar rotas recentes:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/dashboard/consumption
 * Dados de consumo do plano do usuário
 */
router.get("/consumption", async (req, res) => {
  try {
    const userId = req.user.id;
    const currentMonth = new Date().toISOString().slice(0, 7);

    const consumptionQuery = `
      WITH usage_data AS (
        SELECT 
          COUNT(CASE WHEN DATE_TRUNC('month', r.created_at) = DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as routes_this_month,
          COUNT(CASE WHEN r.route_type = 'immediate' AND DATE_TRUNC('month', r.created_at) = DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as immediate_routes_this_month,
          COUNT(DISTINCT rs.set_name) as total_sets,
          (SELECT COUNT(*) FROM clients WHERE user_id = $1 AND deleted_at IS NULL) as total_clients
        FROM routes r
        LEFT JOIN route_sets rs ON r.id = rs.route_id
        WHERE r.user_id = $1 AND r.deleted_at IS NULL
      ),
      plan_limits AS (
        SELECT 
          up.max_routes_monthly,
          up.max_immediate_routes,
          up.max_route_sets,
          up.max_clients
        FROM user_preferences up
        WHERE up.user_id = $1
      )
      SELECT 
        ud.routes_this_month,
        ud.immediate_routes_this_month,
        ud.total_sets,
        ud.total_clients,
        pl.max_routes_monthly,
        pl.max_immediate_routes,
        pl.max_route_sets,
        pl.max_clients
      FROM usage_data ud
      CROSS JOIN plan_limits pl
    `;

    const result = await query(consumptionQuery, [userId]);
    const data = result.rows[0];

    const consumption = [
      {
        label: "Rotas Permanentes",
        current: parseInt(data.routes_this_month) || 0,
        limit: parseInt(data.max_routes_monthly) || 100,
        percentage: Math.round(((parseInt(data.routes_this_month) || 0) / (parseInt(data.max_routes_monthly) || 100)) * 100),
        icon: "Route",
        color: "text-blue-600",
        description: `${data.routes_this_month || 0} de ${data.max_routes_monthly || 100} rotas utilizadas`
      },
      {
        label: "Rotas Imediatas",
        current: parseInt(data.immediate_routes_this_month) || 0,
        limit: parseInt(data.max_immediate_routes) || 50,
        percentage: Math.round(((parseInt(data.immediate_routes_this_month) || 0) / (parseInt(data.max_immediate_routes) || 50)) * 100),
        icon: "Zap",
        color: "text-yellow-600",
        description: `${data.immediate_routes_this_month || 0} de ${data.max_immediate_routes || 50} rotas utilizadas`
      },
      {
        label: "Conjuntos criados",
        current: parseInt(data.total_sets) || 0,
        limit: parseInt(data.max_route_sets) || 20,
        percentage: Math.round(((parseInt(data.total_sets) || 0) / (parseInt(data.max_route_sets) || 20)) * 100),
        icon: "FolderOpen",
        color: "text-purple-600",
        description: `${data.total_sets || 0} de ${data.max_route_sets || 20} conjuntos criados`
      },
      {
        label: "Clientes Adicionados",
        current: parseInt(data.total_clients) || 0,
        limit: parseInt(data.max_clients) || 500,
        percentage: Math.round(((parseInt(data.total_clients) || 0) / (parseInt(data.max_clients) || 500)) * 100),
        icon: "Users",
        color: "text-green-600",
        description: `${data.total_clients || 0} de ${data.max_clients || 500} clientes`
      }
    ];

    res.json(consumption);
  } catch (error) {
    console.error("Erro ao buscar dados de consumo:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/dashboard/activity
 * Atividades recentes do usuário para o dashboard
 */
router.get("/activity", async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const activityQuery = `
      (
        SELECT 
          'route_created' as type,
          r.name as title,
          'Nova rota criada' as description,
          r.created_at as timestamp,
          json_build_object('routeId', r.id, 'routeName', r.name) as metadata
        FROM routes r
        WHERE r.user_id = $1 AND r.deleted_at IS NULL
      )
      UNION ALL
      (
        SELECT 
          'route_completed' as type,
          r.name as title,
          'Rota completada com sucesso' as description,
          rm.created_at as timestamp,
          json_build_object(
            'routeId', r.id, 
            'routeName', r.name,
            'totalTime', rm.total_time,
            'totalDistance', rm.total_distance,
            'timeSaved', rm.time_saved
          ) as metadata
        FROM route_metrics rm
        JOIN routes r ON rm.route_id = r.id
        WHERE r.user_id = $1
      )
      UNION ALL
      (
        SELECT 
          'navigation_started' as type,
          r.name as title,
          'Navegação iniciada' as description,
          ns.started_at as timestamp,
          json_build_object('routeId', r.id, 'routeName', r.name, 'sessionId', ns.id) as metadata
        FROM navigation_sessions ns
        JOIN routes r ON ns.route_id = r.id
        WHERE r.user_id = $1
      )
      ORDER BY timestamp DESC
      LIMIT $2
    `;

    const result = await query(activityQuery, [userId, parseInt(limit)]);
    
    const activities = result.rows.map(activity => ({
      id: `${activity.type}_${activity.timestamp}`,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      timestamp: activity.timestamp,
      metadata: activity.metadata
    }));

    res.json(activities);
  } catch (error) {
    console.error("Erro ao buscar atividades:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/dashboard/insights
 * Insights e dicas personalizadas para o usuário
 */
router.get("/insights", async (req, res) => {
  try {
    const userId = req.user.id;

    // Análise de padrões para gerar insights personalizados
    const insightsQuery = `
      WITH route_patterns AS (
        SELECT 
          EXTRACT(hour FROM ns.started_at) as hour_of_day,
          COUNT(*) as frequency,
          AVG(rm.efficiency_score) as avg_efficiency
        FROM navigation_sessions ns
        JOIN routes r ON ns.route_id = r.id
        LEFT JOIN route_metrics rm ON r.id = rm.route_id
        WHERE r.user_id = $1 
          AND ns.started_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY EXTRACT(hour FROM ns.started_at)
        ORDER BY frequency DESC
        LIMIT 1
      ),
      efficiency_trends AS (
        SELECT 
          AVG(efficiency_score) as avg_efficiency,
          COUNT(*) as total_routes
        FROM route_metrics rm
        JOIN routes r ON rm.route_id = r.id
        WHERE r.user_id = $1
          AND rm.created_at >= CURRENT_DATE - INTERVAL '7 days'
      )
      SELECT 
        rp.hour_of_day as peak_hour,
        rp.frequency as peak_frequency,
        rp.avg_efficiency as peak_efficiency,
        et.avg_efficiency as recent_efficiency,
        et.total_routes as recent_route_count
      FROM route_patterns rp
      CROSS JOIN efficiency_trends et
    `;

    const result = await query(insightsQuery, [userId]);
    const data = result.rows[0];

    const insights = [];

    if (data && data.peak_hour !== null) {
      const hour = parseInt(data.peak_hour);
      const timeOfDay = hour < 12 ? 'manhã' : hour < 18 ? 'tarde' : 'noite';
      
      insights.push({
        type: 'tip',
        title: 'Dica do Dia',
        message: `Você costuma viajar mais na ${timeOfDay} (${hour}h). Considere rotas alternativas para evitar trânsito intenso.`,
        icon: 'Clock',
        priority: 'medium'
      });
    }

    if (data && data.recent_efficiency !== null && data.recent_efficiency < 70) {
      insights.push({
        type: 'warning',
        title: 'Eficiência em baixa',
        message: `Sua eficiência média caiu para ${Math.round(data.recent_efficiency)}%. Que tal otimizar suas rotas?`,
        icon: 'TrendingDown',
        priority: 'high'
      });
    }

    if (data && data.recent_route_count > 10) {
      insights.push({
        type: 'achievement',
        title: 'Excelente atividade!',
        message: `Você completou ${data.recent_route_count} rotas esta semana. Continue assim!`,
        icon: 'Trophy',
        priority: 'low'
      });
    }

    // Insight padrão se não houver dados suficientes
    if (insights.length === 0) {
      insights.push({
        type: 'tip',
        title: 'Dica do Dia',
        message: 'Evite a Rua das Palmeiras entre 17h-19h. Trânsito intenso pode aumentar seu tempo de viagem em até 15 minutos.',
        icon: 'Zap',
        priority: 'medium'
      });
    }

    res.json(insights);
  } catch (error) {
    console.error("Erro ao buscar insights:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
