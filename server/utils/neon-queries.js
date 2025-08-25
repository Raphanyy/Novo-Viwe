import { sql, withTransaction } from "../config/database.js";

// Exemplo de queries para o sistema Viwe
export const userQueries = {
  // Buscar usuário por ID
  async findById(userId) {
    const [user] = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `;
    return user;
  },

  // Buscar usuário por email
  async findByEmail(email) {
    const [user] = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return user;
  },

  // Criar novo usuário
  async create(userData) {
    const { name, email, password_hash } = userData;
    const [user] = await sql`
      INSERT INTO users (name, email, password_hash, created_at)
      VALUES (${name}, ${email}, ${password_hash}, NOW())
      RETURNING id, name, email, created_at
    `;
    return user;
  },

  // Atualizar perfil do usuário
  async updateProfile(userId, profileData) {
    const { name, email } = profileData;
    const [user] = await sql`
      UPDATE users 
      SET name = ${name}, email = ${email}, updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, name, email, updated_at
    `;
    return user;
  },
};

// Queries para rotas de navegação
export const routeQueries = {
  // Salvar rota do usuário
  async saveRoute(userId, routeData) {
    const { start_location, end_location, route_data, name } = routeData;
    const [route] = await sql`
      INSERT INTO user_routes (user_id, start_location, end_location, route_data, name, created_at)
      VALUES (${userId}, ${start_location}, ${end_location}, ${route_data}, ${name}, NOW())
      RETURNING *
    `;
    return route;
  },

  // Buscar rotas do usuário
  async getUserRoutes(userId, limit = 10) {
    const routes = await sql`
      SELECT * FROM user_routes 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return routes;
  },

  // Deletar rota
  async deleteRoute(routeId, userId) {
    const [deletedRoute] = await sql`
      DELETE FROM user_routes 
      WHERE id = ${routeId} AND user_id = ${userId}
      RETURNING id
    `;
    return deletedRoute;
  },
};

// Queries para POIs (Points of Interest)
export const poiQueries = {
  // Buscar POIs próximos
  async findNearby(lat, lng, radius = 1000) {
    const pois = await sql`
      SELECT *, 
        (6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) 
        * cos(radians(longitude) - radians(${lng})) 
        + sin(radians(${lat})) * sin(radians(latitude)))) AS distance
      FROM pois
      HAVING distance < ${radius / 1000}
      ORDER BY distance
      LIMIT 50
    `;
    return pois;
  },

  // Adicionar novo POI
  async create(poiData) {
    const { name, latitude, longitude, type, description, user_id } = poiData;
    const [poi] = await sql`
      INSERT INTO pois (name, latitude, longitude, type, description, user_id, created_at)
      VALUES (${name}, ${latitude}, ${longitude}, ${type}, ${description}, ${user_id}, NOW())
      RETURNING *
    `;
    return poi;
  },
};

// Exemplo de transação complexa
export const complexTransactions = {
  // Criar usuário com perfil inicial
  async createUserWithProfile(userData, profileData) {
    return withTransaction([
      sql`
        INSERT INTO users (name, email, password_hash, created_at)
        VALUES (${userData.name}, ${userData.email}, ${userData.password_hash}, NOW())
        RETURNING id
      `,
      sql`
        INSERT INTO user_profiles (user_id, bio, preferences, created_at)
        VALUES (${userData.id}, ${profileData.bio}, ${profileData.preferences}, NOW())
        RETURNING *
      `,
    ]);
  },
};
