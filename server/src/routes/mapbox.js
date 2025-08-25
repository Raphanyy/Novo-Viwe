const express = require("express");
const rateLimit = require("express-rate-limit");
const { authenticateToken } = require("../middleware/auth");
const { query } = require("../utils/neon-database");
const {
  geocoding,
  reverseGeocoding,
  directions,
  optimization,
  matrix,
  isochrone,
} = require("../services/mapbox");

const router = express.Router();

// Rate limiting específico para Mapbox (mais restritivo)
const mapboxLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 requests por minuto
  message: {
    error:
      "Limite de requisições Mapbox excedido, tente novamente em 1 minuto.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(mapboxLimiter);
router.use(authenticateToken);

/**
 * GET /api/mapbox/geocoding
 * Buscar coordenadas de um endereço
 */
router.get("/geocoding", async (req, res) => {
  try {
    const { q: query, limit, country, types, proximity } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        error: 'Parâmetro "q" (query) é obrigatório',
      });
    }

    const options = {
      limit: limit ? parseInt(limit) : 8,
      country: country || "BR",
      types: types || null,
      proximity: proximity ? proximity.split(",").map(Number) : null,
    };

    const results = await geocoding(query, options);

    // Salvar busca no cache (opcional)
    try {
      await saveSearchResult(req.user.id, query, results);
    } catch (cacheError) {
      console.warn("Erro ao salvar cache de busca:", cacheError.message);
    }

    res.json({
      query,
      results,
      count: results.length,
      cached: false,
    });
  } catch (error) {
    console.error("Erro no geocoding:", error.message);

    if (error.message.includes("Token do Mapbox")) {
      return res.status(503).json({
        error: "Serviço de geocoding temporariamente indisponível",
      });
    }

    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/mapbox/reverse
 * Buscar endereço de coordenadas
 */
router.get("/reverse", async (req, res) => {
  try {
    const { lat, lng, country, types } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: 'Parâmetros "lat" e "lng" são obrigatórios',
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: "Coordenadas devem ser números válidos",
      });
    }

    const options = {
      country: country || "BR",
      types: types || "address,poi",
    };

    const result = await reverseGeocoding(longitude, latitude, options);

    res.json({
      coordinates: [longitude, latitude],
      result: result || null,
    });
  } catch (error) {
    console.error("Erro no reverse geocoding:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/mapbox/directions
 * Calcular rota entre pontos
 */
router.post("/directions", async (req, res) => {
  try {
    const { coordinates, profile, overview, steps } = req.body;

    if (!coordinates || !Array.isArray(coordinates)) {
      return res.status(400).json({
        error: 'Campo "coordinates" é obrigatório e deve ser um array',
      });
    }

    if (coordinates.length < 2) {
      return res.status(400).json({
        error: "Pelo menos 2 coordenadas são necessárias",
      });
    }

    if (coordinates.length > 25) {
      return res.status(400).json({
        error: "Máximo de 25 coordenadas permitidas",
      });
    }

    const options = {
      profile: profile || "driving",
      overview: overview || "full",
      steps: steps !== false,
    };

    const result = await directions(coordinates, options);

    res.json({
      coordinates,
      route: result,
      summary: {
        distance: result.distance,
        duration: result.duration,
        distanceKm: Math.round((result.distance / 1000) * 100) / 100,
        durationMinutes: Math.round(result.duration / 60),
      },
    });
  } catch (error) {
    console.error("Erro no directions:", error.message);

    if (
      error.message.includes("Coordenada") ||
      error.message.includes("coordenadas")
    ) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/mapbox/optimization
 * Otimizar ordem de múltiplas paradas
 */
router.post("/optimization", async (req, res) => {
  try {
    const { coordinates, profile, roundtrip, source, destination } = req.body;

    if (!coordinates || !Array.isArray(coordinates)) {
      return res.status(400).json({
        error: 'Campo "coordinates" é obrigatório e deve ser um array',
      });
    }

    if (coordinates.length < 3) {
      return res.status(400).json({
        error: "Pelo menos 3 coordenadas são necessárias para otimização",
      });
    }

    if (coordinates.length > 25) {
      return res.status(400).json({
        error: "Máximo de 25 coordenadas permitidas",
      });
    }

    const options = {
      profile: profile || "driving",
      roundtrip: roundtrip || false,
      source: source || "first",
      destination: destination || "last",
    };

    const result = await optimization(coordinates, options);

    res.json({
      originalCoordinates: coordinates,
      optimizedRoute: result,
      optimization: {
        originalOrder: coordinates.map((_, index) => index),
        optimizedOrder: result.waypointsOrder,
        distanceSaved: 0, // TODO: calcular economia
        timeSaved: 0, // TODO: calcular economia
      },
      summary: {
        distance: result.distance,
        duration: result.duration,
        distanceKm: Math.round((result.distance / 1000) * 100) / 100,
        durationMinutes: Math.round(result.duration / 60),
      },
    });
  } catch (error) {
    console.error("Erro na otimização:", error.message);

    if (error.message.includes("coordenadas")) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * POST /api/mapbox/matrix
 * Calcular matriz de distâncias/tempos
 */
router.post("/matrix", async (req, res) => {
  try {
    const { coordinates, profile, sources, destinations } = req.body;

    if (!coordinates || !Array.isArray(coordinates)) {
      return res.status(400).json({
        error: 'Campo "coordinates" é obrigatório e deve ser um array',
      });
    }

    if (coordinates.length > 25) {
      return res.status(400).json({
        error: "Máximo de 25 coordenadas permitidas",
      });
    }

    const options = {
      profile: profile || "driving",
      sources: sources || null,
      destinations: destinations || null,
    };

    const result = await matrix(coordinates, options);

    res.json({
      coordinates,
      matrix: result,
      summary: {
        coordinatesCount: coordinates.length,
        matrixSize: `${result.durations.length}x${result.durations[0].length}`,
      },
    });
  } catch (error) {
    console.error("Erro na matrix:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/mapbox/isochrone
 * Calcular área alcançável em determinado tempo
 */
router.get("/isochrone", async (req, res) => {
  try {
    const { lat, lng, minutes, profile } = req.query;

    if (!lat || !lng || !minutes) {
      return res.status(400).json({
        error: 'Parâmetros "lat", "lng" e "minutes" são obrigatórios',
      });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const contours_minutes = parseInt(minutes);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(contours_minutes)) {
      return res.status(400).json({
        error: "Parâmetros devem ser números válidos",
      });
    }

    if (contours_minutes < 1 || contours_minutes > 60) {
      return res.status(400).json({
        error: "Tempo deve estar entre 1 e 60 minutos",
      });
    }

    const options = {
      profile: profile || "driving",
    };

    const result = await isochrone(
      [longitude, latitude],
      contours_minutes,
      options,
    );

    res.json({
      center: [longitude, latitude],
      minutes: contours_minutes,
      profile: options.profile,
      isochrone: result,
    });
  } catch (error) {
    console.error("Erro no isochrone:", error.message);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

/**
 * GET /api/mapbox/health
 * Verificar status do serviço Mapbox
 */
router.get("/health", async (req, res) => {
  try {
    // Teste simples de geocoding
    const testResult = await geocoding("São Paulo", { limit: 1 });

    res.json({
      status: "OK",
      mapbox: "connected",
      testQuery: "São Paulo",
      testResult: testResult.length > 0 ? "success" : "no_results",
      features: {
        geocoding: true,
        directions: true,
        optimization: true,
        matrix: true,
        isochrone: true,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      mapbox: "disconnected",
      error: error.message,
      features: {
        geocoding: false,
        directions: false,
        optimization: false,
        matrix: false,
        isochrone: false,
      },
    });
  }
});

/**
 * Função auxiliar para salvar resultado de busca no cache
 */
async function saveSearchResult(userId, searchQuery, results) {
  if (!results || results.length === 0) return;

  const firstResult = results[0];

  try {
    await query(
      `INSERT INTO search_results (
        user_id, search_query, place_name, text_name, 
        latitude, longitude, place_types, properties, relevance
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT DO NOTHING`,
      [
        userId,
        searchQuery,
        firstResult.placeName,
        firstResult.text,
        firstResult.center[1], // lat
        firstResult.center[0], // lng
        firstResult.placeType,
        JSON.stringify(firstResult.properties),
        firstResult.relevance,
      ],
    );
  } catch (error) {
    console.warn("Erro ao salvar cache de busca:", error.message);
  }
}

module.exports = router;
