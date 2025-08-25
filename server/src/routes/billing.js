const express = require("express");
const { query, manualTransaction } = require("../utils/neon-database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Rate limiting específico para billing
const rateLimit = require("express-rate-limit");
const billingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 tentativas
  message: {
    error: "Muitas tentativas de billing, tente novamente em 15 minutos.",
  },
});

router.use(billingLimiter);
router.use(authenticateToken);

// Stripe setup (comentado por enquanto)
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * GET /api/billing/plans
 * Listar planos disponíveis
 */
router.get("/plans", async (req, res) => {
  try {
    const plansResult = await query(
      `SELECT * FROM plans 
       WHERE is_active = true 
       ORDER BY price_cents ASC`,
    );

    const plans = plansResult.rows.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: {
        cents: plan.price_cents,
        currency: plan.currency,
        formatted: formatPrice(plan.price_cents, plan.currency),
      },
      billingPeriod: plan.billing_period,
      features: plan.features,
      limits: {
        maxRoutes: plan.max_routes,
        maxStopsPerRoute: plan.max_stops_per_route,
      },
      capabilities: {
        hasOptimization: plan.has_optimization,
        hasRealTimeTraffic: plan.has_real_time_traffic,
        hasOfflineMaps: plan.has_offline_maps,
        hasAdvancedAnalytics: plan.has_advanced_analytics,
      },
      isComingSoon: plan.is_coming_soon,
      createdAt: plan.created_at,
    }));

    res.json({
      plans,
      count: plans.length,
    });
  } catch (error) {
    console.error("Erro ao buscar planos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/billing/subscription
 * Obter assinatura atual do usuário
 */
router.get("/subscription", async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptionResult = await query(
      `SELECT 
        s.*, p.name as plan_name, p.description as plan_description,
        p.features, p.max_routes, p.has_optimization,
        p.has_real_time_traffic, p.has_offline_maps,
        p.has_advanced_analytics
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.user_id = $1 AND s.status IN ('active', 'trialing')
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId],
    );

    if (subscriptionResult.rows.length === 0) {
      // Usuário no plano básico (gratuito)
      const basicPlanResult = await query(
        "SELECT * FROM plans WHERE name = 'Básico' AND is_active = true",
      );

      if (basicPlanResult.rows.length > 0) {
        const basicPlan = basicPlanResult.rows[0];
        return res.json({
          subscription: null,
          currentPlan: {
            id: basicPlan.id,
            name: basicPlan.name,
            description: basicPlan.description,
            price: {
              cents: 0,
              currency: "BRL",
              formatted: "Gratuito",
            },
            features: basicPlan.features,
            limits: {
              maxRoutes: basicPlan.max_routes,
              maxStopsPerRoute: basicPlan.max_stops_per_route,
            },
            capabilities: {
              hasOptimization: false,
              hasRealTimeTraffic: false,
              hasOfflineMaps: false,
              hasAdvancedAnalytics: false,
            },
          },
          isActive: true,
          isTrial: false,
        });
      }
    }

    const subscription = subscriptionResult.rows[0];

    res.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        startDate: subscription.start_date,
        endDate: subscription.end_date,
        trialEndDate: subscription.trial_end_date,
        cancelledAt: subscription.cancelled_at,
        amount: {
          cents: subscription.amount_cents,
          currency: subscription.currency,
          formatted: formatPrice(
            subscription.amount_cents,
            subscription.currency,
          ),
        },
        billingPeriod: subscription.billing_period,
        routesUsed: subscription.routes_used,
        routesLimit: subscription.routes_limit,
      },
      currentPlan: {
        id: subscription.plan_id,
        name: subscription.plan_name,
        description: subscription.plan_description,
        features: subscription.features,
        limits: {
          maxRoutes: subscription.max_routes,
          maxStopsPerRoute: subscription.max_stops_per_route || -1,
        },
        capabilities: {
          hasOptimization: subscription.has_optimization,
          hasRealTimeTraffic: subscription.has_real_time_traffic,
          hasOfflineMaps: subscription.has_offline_maps,
          hasAdvancedAnalytics: subscription.has_advanced_analytics,
        },
      },
      isActive: subscription.status === "active",
      isTrial: subscription.status === "trialing",
    });
  } catch (error) {
    console.error("Erro ao buscar assinatura:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/billing/subscribe
 * Criar nova assinatura (simulado por enquanto)
 */
router.post("/subscribe", async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId, paymentMethodId } = req.body;

    if (!planId) {
      return res.status(400).json({
        error: "ID do plano é obrigatório",
      });
    }

    // Buscar plano
    const planResult = await query(
      "SELECT * FROM plans WHERE id = $1 AND is_active = true",
      [planId],
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({
        error: "Plano não encontrado",
      });
    }

    const plan = planResult.rows[0];

    // Verificar se usuário já tem assinatura ativa
    const existingSubscription = await query(
      "SELECT id FROM subscriptions WHERE user_id = $1 AND status IN ('active', 'trialing')",
      [userId],
    );

    if (existingSubscription.rows.length > 0) {
      return res.status(400).json({
        error: "Usuário já possui assinatura ativa",
      });
    }

    // Se for plano básico (gratuito)
    if (plan.price_cents === 0) {
      return res.json({
        message: "Usuário mantido no plano básico",
        subscription: null,
        plan: {
          id: plan.id,
          name: plan.name,
          price: "Gratuito",
        },
      });
    }

    const result = await transaction(async (client) => {
      // Por enquanto, criar assinatura sem integração real com Stripe
      const subscriptionResult = await client.query(
        `INSERT INTO subscriptions (
          user_id, plan_id, status, start_date, end_date,
          amount_cents, currency, billing_period, routes_limit
        ) VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '1 month', $4, $5, $6, $7)
        RETURNING *`,
        [
          userId,
          planId,
          "active", // Em produção seria 'pending' até confirmação do Stripe
          plan.price_cents,
          plan.currency,
          plan.billing_period,
          plan.max_routes,
        ],
      );

      const subscription = subscriptionResult.rows[0];

      // Atualizar plano do usuário
      await client.query(
        "UPDATE users SET plan_type = $1, plan_expires_at = $2 WHERE id = $3",
        [plan.name.toLowerCase(), subscription.end_date, userId],
      );

      // Criar registro de pagamento (simulado)
      await client.query(
        `INSERT INTO payment_history (
          user_id, subscription_id, amount_cents, currency,
          status, payment_method, gateway_provider, gateway_transaction_id,
          description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          userId,
          subscription.id,
          plan.price_cents,
          plan.currency,
          "completed", // Em produção seria 'pending'
          "credit_card",
          "stripe",
          `sim_${Date.now()}`, // Transaction ID simulado
          `Assinatura do plano ${plan.name}`,
        ],
      );

      // Log de auditoria
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
         VALUES ($1, 'subscribe_plan', 'Subscription', $2, $3)`,
        [
          userId,
          subscription.id,
          JSON.stringify({ planId, planName: plan.name }),
        ],
      );

      return subscription;
    });

    res.status(201).json({
      message: "Assinatura criada com sucesso",
      subscription: {
        id: result.id,
        planName: plan.name,
        status: result.status,
        startDate: result.start_date,
        endDate: result.end_date,
        amount: formatPrice(result.amount_cents, result.currency),
      },
      note: "Esta é uma implementação simulada. Em produção, integraria com Stripe.",
    });
  } catch (error) {
    console.error("Erro ao criar assinatura:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/billing/cancel
 * Cancelar assinatura atual
 */
router.post("/cancel", async (req, res) => {
  try {
    const userId = req.user.id;
    const { reason } = req.body;

    const result = await transaction(async (client) => {
      // Buscar assinatura ativa
      const subscriptionResult = await client.query(
        "SELECT * FROM subscriptions WHERE user_id = $1 AND status = 'active'",
        [userId],
      );

      if (subscriptionResult.rows.length === 0) {
        throw new Error("Nenhuma assinatura ativa encontrada");
      }

      const subscription = subscriptionResult.rows[0];

      // Cancelar assinatura (manter até final do período)
      const cancelledSubscription = await client.query(
        `UPDATE subscriptions 
         SET status = 'cancelled', cancelled_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [subscription.id],
      );

      // Log de auditoria
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values)
         VALUES ($1, 'cancel_subscription', 'Subscription', $2, $3)`,
        [
          userId,
          subscription.id,
          JSON.stringify({ reason: reason || "User requested cancellation" }),
        ],
      );

      return cancelledSubscription.rows[0];
    });

    res.json({
      message: "Assinatura cancelada com sucesso",
      subscription: {
        id: result.id,
        status: result.status,
        cancelledAt: result.cancelled_at,
        remainsActiveUntil: result.end_date,
      },
      note: "Sua assinatura permanecerá ativa até o final do período já pago.",
    });
  } catch (error) {
    console.error("Erro ao cancelar assinatura:", error);
    if (error.message === "Nenhuma assinatura ativa encontrada") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/billing/history
 * Histórico de pagamentos do usuário
 */
router.get("/history", async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const historyResult = await query(
      `SELECT 
        ph.*, s.id as subscription_id, p.name as plan_name
       FROM payment_history ph
       LEFT JOIN subscriptions s ON ph.subscription_id = s.id
       LEFT JOIN plans p ON s.plan_id = p.id
       WHERE ph.user_id = $1
       ORDER BY ph.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit), parseInt(offset)],
    );

    const payments = historyResult.rows.map((payment) => ({
      id: payment.id,
      amount: {
        cents: payment.amount_cents,
        currency: payment.currency,
        formatted: formatPrice(payment.amount_cents, payment.currency),
      },
      status: payment.status,
      paymentMethod: payment.payment_method,
      gatewayProvider: payment.gateway_provider,
      description: payment.description,
      planName: payment.plan_name,
      invoiceUrl: payment.invoice_url,
      receiptUrl: payment.receipt_url,
      createdAt: payment.created_at,
      paidAt: payment.paid_at,
      refundedAt: payment.refunded_at,
    }));

    // Contar total
    const countResult = await query(
      "SELECT COUNT(*) as total FROM payment_history WHERE user_id = $1",
      [userId],
    );

    res.json({
      payments,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: parseInt(countResult.rows[0].total),
        hasMore:
          parseInt(offset) + parseInt(limit) <
          parseInt(countResult.rows[0].total),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar histórico de pagamentos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/billing/usage
 * Uso atual da assinatura
 */
router.get("/usage", async (req, res) => {
  try {
    const userId = req.user.id;

    // Buscar assinatura atual
    const subscriptionResult = await query(
      `SELECT s.*, p.max_routes, p.name as plan_name
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.user_id = $1 AND s.status IN ('active', 'trialing')
       ORDER BY s.created_at DESC
       LIMIT 1`,
      [userId],
    );

    // Contar rotas criadas no período atual
    const routesResult = await query(
      `SELECT COUNT(*) as routes_count
       FROM routes
       WHERE user_id = $1 AND deleted_at IS NULL
         AND created_at >= DATE_TRUNC('month', NOW())`,
      [userId],
    );

    const routesCount = parseInt(routesResult.rows[0].routes_count);

    if (subscriptionResult.rows.length === 0) {
      // Plano básico
      const basicLimit = 5; // limite do plano básico
      return res.json({
        usage: {
          routesUsed: routesCount,
          routesLimit: basicLimit,
          routesRemaining: Math.max(0, basicLimit - routesCount),
          usagePercent: Math.min(100, (routesCount / basicLimit) * 100),
        },
        plan: {
          name: "Básico",
          type: "free",
        },
        billingPeriod: {
          start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        },
      });
    }

    const subscription = subscriptionResult.rows[0];
    const limit =
      subscription.max_routes === -1 ? null : subscription.max_routes;

    res.json({
      usage: {
        routesUsed: routesCount,
        routesLimit: limit,
        routesRemaining: limit ? Math.max(0, limit - routesCount) : null,
        usagePercent: limit ? Math.min(100, (routesCount / limit) * 100) : 0,
      },
      plan: {
        name: subscription.plan_name,
        type: "paid",
      },
      subscription: {
        id: subscription.id,
        status: subscription.status,
        startDate: subscription.start_date,
        endDate: subscription.end_date,
      },
      billingPeriod: {
        start: subscription.start_date,
        end: subscription.end_date,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar uso da assinatura:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/billing/webhooks/stripe
 * Webhook do Stripe (placeholder)
 */
router.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      // const sig = req.headers['stripe-signature'];
      // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

      // Por enquanto, apenas log
      console.log("Webhook Stripe recebido (simulado):", {
        timestamp: new Date().toISOString(),
        bodySize: req.body.length,
      });

      res.json({ received: true });
    } catch (error) {
      console.error("Erro no webhook Stripe:", error);
      res.status(400).json({ error: "Webhook error" });
    }
  },
);

/**
 * Função auxiliar para formatar preço
 */
function formatPrice(cents, currency = "BRL") {
  const amount = cents / 100;

  if (currency === "BRL") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

module.exports = router;
