const https = require("https");

const MAPBOX_ACCESS_TOKEN =
  process.env.VITE_MAPBOX_ACCESS_TOKEN || process.env.MAPBOX_ACCESS_TOKEN;

if (!MAPBOX_ACCESS_TOKEN) {
  console.warn(
    "⚠️ Token do Mapbox não configurado - funcionalidades de geocoding limitadas",
  );
}

/**
 * Fazer requisição HTTP para API do Mapbox
 * @param {string} url - URL da API
 * @returns {Promise<Object>} Resposta da API
 */
const makeMapboxRequest = (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);

            if (res.statusCode === 200) {
              resolve(parsed);
            } else {
              reject(
                new Error(
                  `Mapbox API Error: ${parsed.message || "Unknown error"}`,
                ),
              );
            }
          } catch (err) {
            reject(new Error(`Error parsing Mapbox response: ${err.message}`));
          }
        });
      })
      .on("error", (err) => {
        reject(new Error(`HTTP Request Error: ${err.message}`));
      });
  });
};

/**
 * Geocoding - Buscar coordenadas de um endereço
 * @param {string} query - Endereço ou termo de busca
 * @param {Object} options - Opções da busca
 * @returns {Promise<Array>} Lista de resultados
 */
const geocoding = async (query, options = {}) => {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error("Token do Mapbox não configurado");
  }

  if (!query || typeof query !== "string") {
    throw new Error("Query é obrigatória e deve ser string");
  }

  const {
    limit = 8,
    country = "BR",
    language = "pt",
    types = null, // place, region, postcode, district, locality, neighborhood, address, poi
    proximity = null, // [lng, lat]
  } = options;

  // Construir URL
  const baseUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places";
  const encodedQuery = encodeURIComponent(query.trim());

  let url = `${baseUrl}/${encodedQuery}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;
  url += `&country=${country}&language=${language}&limit=${limit}`;

  if (types) {
    url += `&types=${types}`;
  }

  if (proximity && Array.isArray(proximity) && proximity.length === 2) {
    url += `&proximity=${proximity[0]},${proximity[1]}`;
  }

  try {
    const response = await makeMapboxRequest(url);

    return response.features.map((feature) => ({
      id: feature.id,
      placeName: feature.place_name,
      text: feature.text,
      center: feature.center, // [lng, lat]
      placeType: feature.place_type,
      relevance: feature.relevance,
      properties: feature.properties,
      context: feature.context,
      bbox: feature.bbox,
    }));
  } catch (error) {
    console.error("Erro no geocoding:", error.message);
    throw error;
  }
};

/**
 * Reverse Geocoding - Buscar endereço de coordenadas
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @param {Object} options - Opções da busca
 * @returns {Promise<Object>} Resultado do endereço
 */
const reverseGeocoding = async (lng, lat, options = {}) => {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error("Token do Mapbox não configurado");
  }

  if (typeof lng !== "number" || typeof lat !== "number") {
    throw new Error("Coordenadas devem ser números válidos");
  }

  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    throw new Error("Coordenadas inválidas");
  }

  const { country = "BR", language = "pt", types = "address,poi" } = options;

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=${country}&language=${language}&types=${types}&limit=1`;

  try {
    const response = await makeMapboxRequest(url);

    if (response.features && response.features.length > 0) {
      const feature = response.features[0];
      return {
        placeName: feature.place_name,
        text: feature.text,
        center: feature.center,
        placeType: feature.place_type,
        properties: feature.properties,
        context: feature.context,
      };
    }

    return null;
  } catch (error) {
    console.error("Erro no reverse geocoding:", error.message);
    throw error;
  }
};

/**
 * Directions - Calcular rota entre pontos
 * @param {Array} coordinates - Array de coordenadas [[lng, lat], ...]
 * @param {Object} options - Opções da rota
 * @returns {Promise<Object>} Dados da rota
 */
const directions = async (coordinates, options = {}) => {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error("Token do Mapbox não configurado");
  }

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error("Pelo menos 2 coordenadas são necessárias");
  }

  // Validar coordenadas
  for (let i = 0; i < coordinates.length; i++) {
    const [lng, lat] = coordinates[i];
    if (typeof lng !== "number" || typeof lat !== "number") {
      throw new Error(`Coordenada ${i} inválida: deve ser [lng, lat]`);
    }
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      throw new Error(`Coordenada ${i} fora do range válido`);
    }
  }

  const {
    profile = "driving", // driving, walking, cycling, driving-traffic
    overview = "full", // full, simplified, false
    steps = true,
    geometries = "geojson",
    language = "pt",
  } = options;

  // Construir coordenadas string
  const coordinatesString = coordinates
    .map((coord) => `${coord[0]},${coord[1]}`)
    .join(";");

  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinatesString}?access_token=${MAPBOX_ACCESS_TOKEN}&overview=${overview}&steps=${steps}&geometries=${geometries}&language=${language}`;

  try {
    const response = await makeMapboxRequest(url);

    if (response.routes && response.routes.length > 0) {
      const route = response.routes[0];

      return {
        distance: route.distance, // metros
        duration: route.duration, // segundos
        geometry: route.geometry,
        legs: route.legs,
        steps: route.legs.flatMap((leg) => leg.steps || []),
        waypoints: response.waypoints,
      };
    }

    throw new Error("Nenhuma rota encontrada");
  } catch (error) {
    console.error("Erro no directions:", error.message);
    throw error;
  }
};

/**
 * Optimization - Otimizar ordem de múltiplas paradas
 * @param {Array} coordinates - Array de coordenadas [[lng, lat], ...]
 * @param {Object} options - Opções da otimização
 * @returns {Promise<Object>} Rota otimizada
 */
const optimization = async (coordinates, options = {}) => {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error("Token do Mapbox não configurado");
  }

  if (!Array.isArray(coordinates) || coordinates.length < 3) {
    throw new Error("Pelo menos 3 coordenadas são necessárias para otimização");
  }

  if (coordinates.length > 25) {
    throw new Error("Máximo de 25 coordenadas permitidas");
  }

  // Validar coordenadas
  for (let i = 0; i < coordinates.length; i++) {
    const [lng, lat] = coordinates[i];
    if (typeof lng !== "number" || typeof lat !== "number") {
      throw new Error(`Coordenada ${i} inválida: deve ser [lng, lat]`);
    }
  }

  const {
    profile = "driving", // driving, walking, cycling
    roundtrip = false, // retornar ao ponto inicial
    source = "first", // first, last, any
    destination = "last", // first, last, any
    overview = "full",
    steps = true,
    geometries = "geojson",
  } = options;

  // Construir coordenadas string
  const coordinatesString = coordinates
    .map((coord) => `${coord[0]},${coord[1]}`)
    .join(";");

  const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/${profile}/${coordinatesString}?access_token=${MAPBOX_ACCESS_TOKEN}&roundtrip=${roundtrip}&source=${source}&destination=${destination}&overview=${overview}&steps=${steps}&geometries=${geometries}`;

  try {
    const response = await makeMapboxRequest(url);

    if (response.trips && response.trips.length > 0) {
      const trip = response.trips[0];

      return {
        distance: trip.distance, // metros
        duration: trip.duration, // segundos
        geometry: trip.geometry,
        legs: trip.legs,
        waypoints: response.waypoints,
        waypointsOrder: response.waypoints.map((wp) => wp.waypoint_index),
        steps: trip.legs.flatMap((leg) => leg.steps || []),
      };
    }

    throw new Error("Nenhuma otimização encontrada");
  } catch (error) {
    console.error("Erro na otimização:", error.message);
    throw error;
  }
};

/**
 * Matrix - Calcular matriz de distâncias/tempos
 * @param {Array} coordinates - Array de coordenadas [[lng, lat], ...]
 * @param {Object} options - Opções da matriz
 * @returns {Promise<Object>} Matriz de distâncias/tempos
 */
const matrix = async (coordinates, options = {}) => {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error("Token do Mapbox não configurado");
  }

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    throw new Error("Pelo menos 2 coordenadas são necessárias");
  }

  if (coordinates.length > 25) {
    throw new Error("Máximo de 25 coordenadas permitidas");
  }

  const {
    profile = "driving",
    sources = null, // índices das coordenadas de origem
    destinations = null, // índices das coordenadas de destino
  } = options;

  // Construir coordenadas string
  const coordinatesString = coordinates
    .map((coord) => `${coord[0]},${coord[1]}`)
    .join(";");

  let url = `https://api.mapbox.com/directions-matrix/v1/mapbox/${profile}/${coordinatesString}?access_token=${MAPBOX_ACCESS_TOKEN}`;

  if (sources) {
    url += `&sources=${sources.join(";")}`;
  }

  if (destinations) {
    url += `&destinations=${destinations.join(";")}`;
  }

  try {
    const response = await makeMapboxRequest(url);

    return {
      durations: response.durations, // matriz de tempos em segundos
      distances: response.distances, // matriz de distâncias em metros
      sources: response.sources,
      destinations: response.destinations,
    };
  } catch (error) {
    console.error("Erro na matrix:", error.message);
    throw error;
  }
};

/**
 * Isochrone - Calcular área alcançável em determinado tempo
 * @param {Array} coordinate - Coordenada [lng, lat]
 * @param {number} contours_minutes - Tempo em minutos
 * @param {Object} options - Opções do isochrone
 * @returns {Promise<Object>} Polígono da área alcançável
 */
const isochrone = async (coordinate, contours_minutes, options = {}) => {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error("Token do Mapbox não configurado");
  }

  if (!Array.isArray(coordinate) || coordinate.length !== 2) {
    throw new Error("Coordenada deve ser [lng, lat]");
  }

  const [lng, lat] = coordinate;
  if (typeof lng !== "number" || typeof lat !== "number") {
    throw new Error("Coordenadas devem ser números válidos");
  }

  const { profile = "driving", polygons = true, denoise = 1 } = options;

  const url = `https://api.mapbox.com/isochrone/v1/mapbox/${profile}/${lng},${lat}?access_token=${MAPBOX_ACCESS_TOKEN}&contours_minutes=${contours_minutes}&polygons=${polygons}&denoise=${denoise}`;

  try {
    const response = await makeMapboxRequest(url);
    return response;
  } catch (error) {
    console.error("Erro no isochrone:", error.message);
    throw error;
  }
};

module.exports = {
  geocoding,
  reverseGeocoding,
  directions,
  optimization,
  matrix,
  isochrone,
};
