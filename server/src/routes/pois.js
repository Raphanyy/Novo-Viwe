const express = require("express");
const { query, transaction } = require("../utils/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

/**
 * GET /api/pois
 * Listar POIs com filtros por localização e categoria
 */
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      lat,
      lng,
      radius = 5000, // 5km por padrão
      category,
      search,
      limit = 20,
      offset = 0,
      includeUserPois = true
    } = req.query;

    let poisQuery = `
      SELECT
        p.id,
        p.name,
        p.type as category,
        p.description,
        p.latitude,
        p.longitude,
        p.address,
        p.phone,
        p.website,
        p.rating,
        p.hours as business_hours,
        p.metadata,
        p.is_verified,
        p.created_at,
        p.color,
        p.icon,
        CASE
          WHEN p.user_id = $1 THEN true
          ELSE false
        END as is_user_poi
    `;

    const params = [userId];
    let paramIndex = 2;

    // Se coordenadas fornecidas, calcular distância
    if (lat && lng) {
      poisQuery += `,
        ROUND(
          6371000 * acos(
            cos(radians($${paramIndex})) * cos(radians(p.latitude)) * 
            cos(radians(p.longitude) - radians($${paramIndex + 1})) + 
            sin(radians($${paramIndex})) * sin(radians(p.latitude))
          )
        ) as distance`;
      
      params.push(parseFloat(lat), parseFloat(lng));
      paramIndex += 2;
    }

    poisQuery += `
      FROM pois p
      WHERE p.deleted_at IS NULL
    `;

    // Filtro por POIs do usuário
    if (includeUserPois === 'false') {
      poisQuery += ` AND p.user_id IS NULL`;
    } else if (includeUserPois === 'only') {
      poisQuery += ` AND p.user_id = $1`;
    }

    // Filtro por raio de localização
    if (lat && lng) {
      poisQuery += ` AND (
        6371000 * acos(
          cos(radians($${paramIndex})) * cos(radians(p.latitude)) * 
          cos(radians(p.longitude) - radians($${paramIndex + 1})) + 
          sin(radians($${paramIndex})) * sin(radians(p.latitude))
        )
      ) <= $${paramIndex + 2}`;
      
      params.push(parseFloat(lat), parseFloat(lng), parseInt(radius));
      paramIndex += 3;
    }

    // Filtro por categoria
    if (category) {
      poisQuery += ` AND p.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // Filtro por busca textual
    if (search) {
      poisQuery += ` AND (
        p.name ILIKE $${paramIndex} OR 
        p.description ILIKE $${paramIndex} OR 
        p.address ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Ordenação
    if (lat && lng) {
      poisQuery += ` ORDER BY distance ASC`;
    } else {
      poisQuery += ` ORDER BY p.rating DESC NULLS LAST, p.name ASC`;
    }

    // Paginação
    poisQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(poisQuery, params);

    const pois = result.rows.map(poi => ({
      id: poi.id,
      name: poi.name,
      category: poi.category,
      description: poi.description,
      coordinates: [parseFloat(poi.longitude), parseFloat(poi.latitude)],
      address: poi.address,
      phone: poi.phone,
      website: poi.website,
      rating: poi.rating,
      businessHours: poi.business_hours,
      metadata: poi.metadata,
      isVerified: poi.is_verified,
      isUserPoi: poi.is_user_poi,
      distance: poi.distance ? parseInt(poi.distance) : null,
      createdAt: poi.created_at
    }));

    res.json({
      pois,
      total: pois.length,
      hasMore: pois.length === parseInt(limit)
    });

  } catch (error) {
    console.error("Erro ao listar POIs:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/pois/categories
 * Listar categorias disponíveis de POIs
 */
router.get("/categories", async (req, res) => {
  try {
    const categoriesQuery = `
      SELECT 
        category,
        COUNT(*) as count,
        AVG(rating) as avg_rating
      FROM pois 
      WHERE deleted_at IS NULL AND category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC, category ASC
    `;

    const result = await query(categoriesQuery);
    
    const categories = result.rows.map(cat => ({
      id: cat.category,
      name: cat.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: parseInt(cat.count),
      avgRating: cat.avg_rating ? parseFloat(cat.avg_rating).toFixed(1) : null
    }));

    // Adicionar categorias padrão se não existirem
    const defaultCategories = [
      'restaurant', 'gas_station', 'hospital', 'shopping', 'park', 
      'bank', 'pharmacy', 'school', 'hotel', 'tourist_attraction'
    ];

    const existingCategories = categories.map(c => c.id);
    const missingCategories = defaultCategories
      .filter(cat => !existingCategories.includes(cat))
      .map(cat => ({
        id: cat,
        name: cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count: 0,
        avgRating: null
      }));

    res.json([...categories, ...missingCategories]);

  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/pois/:id
 * Obter detalhes de um POI específico
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const poiQuery = `
      SELECT 
        p.*,
        CASE WHEN p.user_id = $1 THEN true ELSE false END as is_user_poi,
        COUNT(DISTINCT rs.id) as usage_count
      FROM pois p
      LEFT JOIN route_stops rs ON (
        p.latitude = rs.latitude AND p.longitude = rs.longitude
      )
      WHERE p.id = $2 AND p.deleted_at IS NULL
      GROUP BY p.id
    `;

    const result = await query(poiQuery, [userId, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "POI não encontrado" });
    }

    const poi = result.rows[0];

    res.json({
      id: poi.id,
      name: poi.name,
      category: poi.category,
      description: poi.description,
      coordinates: [parseFloat(poi.longitude), parseFloat(poi.latitude)],
      address: poi.address,
      phone: poi.phone,
      website: poi.website,
      rating: poi.rating,
      businessHours: poi.business_hours,
      metadata: poi.metadata,
      isVerified: poi.is_verified,
      isUserPoi: poi.is_user_poi,
      usageCount: parseInt(poi.usage_count) || 0,
      createdAt: poi.created_at,
      updatedAt: poi.updated_at
    });

  } catch (error) {
    console.error("Erro ao buscar POI:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/pois
 * Criar novo POI personalizado do usuário
 */
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      category,
      description,
      latitude,
      longitude,
      address,
      phone,
      website,
      businessHours,
      metadata = {}
    } = req.body;

    // Validações básicas
    if (!name || !latitude || !longitude) {
      return res.status(400).json({ 
        error: "Nome, latitude e longitude são obrigatórios" 
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        error: "Coordenadas inválidas" 
      });
    }

    // Verificar se já existe POI muito próximo (dentro de 50 metros)
    const duplicateQuery = `
      SELECT id FROM pois 
      WHERE deleted_at IS NULL
        AND (
          6371000 * acos(
            cos(radians($1)) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians($2)) + 
            sin(radians($1)) * sin(radians(latitude))
          )
        ) <= 50
    `;

    const duplicateResult = await query(duplicateQuery, [latitude, longitude]);
    
    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({ 
        error: "Já existe um POI muito próximo a esta localização" 
      });
    }

    const insertQuery = `
      INSERT INTO pois (
        user_id, name, category, description, latitude, longitude,
        address, phone, website, business_hours, metadata, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
      ) RETURNING *
    `;

    const values = [
      userId, name, category, description, parseFloat(latitude), parseFloat(longitude),
      address, phone, website, businessHours, JSON.stringify(metadata)
    ];

    const result = await query(insertQuery, values);
    const newPoi = result.rows[0];

    res.status(201).json({
      id: newPoi.id,
      name: newPoi.name,
      category: newPoi.category,
      description: newPoi.description,
      coordinates: [parseFloat(newPoi.longitude), parseFloat(newPoi.latitude)],
      address: newPoi.address,
      phone: newPoi.phone,
      website: newPoi.website,
      businessHours: newPoi.business_hours,
      metadata: newPoi.metadata,
      isVerified: newPoi.is_verified,
      isUserPoi: true,
      createdAt: newPoi.created_at
    });

  } catch (error) {
    console.error("Erro ao criar POI:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PATCH /api/pois/:id
 * Atualizar POI do usuário
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Verificar se o POI existe e pertence ao usuário
    const checkQuery = `
      SELECT id FROM pois 
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    `;

    const checkResult = await query(checkQuery, [id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        error: "POI não encontrado ou não pertence ao usuário" 
      });
    }

    // Campos permitidos para atualização
    const allowedFields = [
      'name', 'category', 'description', 'latitude', 'longitude',
      'address', 'phone', 'website', 'business_hours', 'metadata'
    ];

    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(field => {
      if (allowedFields.includes(field) && updates[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        
        if (field === 'metadata') {
          values.push(JSON.stringify(updates[field]));
        } else {
          values.push(updates[field]);
        }
        
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "Nenhum campo válido para atualizar" });
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(id, userId);

    const updateQuery = `
      UPDATE pois 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    const updatedPoi = result.rows[0];

    res.json({
      id: updatedPoi.id,
      name: updatedPoi.name,
      category: updatedPoi.category,
      description: updatedPoi.description,
      coordinates: [parseFloat(updatedPoi.longitude), parseFloat(updatedPoi.latitude)],
      address: updatedPoi.address,
      phone: updatedPoi.phone,
      website: updatedPoi.website,
      businessHours: updatedPoi.business_hours,
      metadata: updatedPoi.metadata,
      isVerified: updatedPoi.is_verified,
      isUserPoi: true,
      updatedAt: updatedPoi.updated_at
    });

  } catch (error) {
    console.error("Erro ao atualizar POI:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/pois/:id
 * Excluir POI do usuário (soft delete)
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar se o POI existe e pertence ao usuário
    const checkQuery = `
      SELECT id FROM pois 
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
    `;

    const checkResult = await query(checkQuery, [id, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        error: "POI não encontrado ou não pertence ao usuário" 
      });
    }

    // Soft delete
    const deleteQuery = `
      UPDATE pois 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND user_id = $2
    `;

    await query(deleteQuery, [id, userId]);

    res.json({ message: "POI excluído com sucesso" });

  } catch (error) {
    console.error("Erro ao excluir POI:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/pois/nearby
 * Buscar POIs próximos a uma localização específica
 */
router.get("/nearby/:lat/:lng", async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { radius = 1000, category, limit = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude e longitude são obrigatórias" });
    }

    let nearbyQuery = `
      SELECT 
        p.id,
        p.name,
        p.category,
        p.description,
        p.latitude,
        p.longitude,
        p.address,
        p.rating,
        p.is_verified,
        ROUND(
          6371000 * acos(
            cos(radians($1)) * cos(radians(p.latitude)) * 
            cos(radians(p.longitude) - radians($2)) + 
            sin(radians($1)) * sin(radians(p.latitude))
          )
        ) as distance
      FROM pois p
      WHERE p.deleted_at IS NULL
        AND (
          6371000 * acos(
            cos(radians($1)) * cos(radians(p.latitude)) * 
            cos(radians(p.longitude) - radians($2)) + 
            sin(radians($1)) * sin(radians(p.latitude))
          )
        ) <= $3
    `;

    const params = [parseFloat(lat), parseFloat(lng), parseInt(radius)];
    let paramIndex = 4;

    if (category) {
      nearbyQuery += ` AND p.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    nearbyQuery += ` ORDER BY distance ASC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await query(nearbyQuery, params);

    const nearbyPois = result.rows.map(poi => ({
      id: poi.id,
      name: poi.name,
      category: poi.category,
      description: poi.description,
      coordinates: [parseFloat(poi.longitude), parseFloat(poi.latitude)],
      address: poi.address,
      rating: poi.rating,
      isVerified: poi.is_verified,
      distance: parseInt(poi.distance)
    }));

    res.json(nearbyPois);

  } catch (error) {
    console.error("Erro ao buscar POIs próximos:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
