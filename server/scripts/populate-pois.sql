-- Script para popular a tabela POIs com pontos de interesse iniciais
-- Execute este script no banco Neon para ter dados de teste

-- Limpar POIs existentes (apenas para desenvolvimento)
-- DELETE FROM pois WHERE user_id IS NULL;

-- POIs em São Paulo, Brasil
INSERT INTO pois (
  name, category, description, latitude, longitude, address, 
  phone, website, rating, business_hours, metadata, is_verified, created_at, updated_at
) VALUES 

-- Shopping Centers
('Shopping Center Norte', 'shopping', 'Um dos maiores shopping centers de São Paulo', -23.5072, -46.6177, 'Travessa Casalbuono, 120 - Vila Guilherme, São Paulo - SP', '+55 11 2229-0100', 'https://www.centronorte.com.br', 4.5, '{"monday": "10:00-22:00", "tuesday": "10:00-22:00", "wednesday": "10:00-22:00", "thursday": "10:00-22:00", "friday": "10:00-22:00", "saturday": "10:00-22:00", "sunday": "14:00-20:00"}', '{"amenities": ["estacionamento", "cinema", "praça de alimentação", "farmácia"], "capacity": 5000}', true, NOW(), NOW()),

('Shopping Morumbi', 'shopping', 'Shopping de luxo na zona sul de São Paulo', -23.6228, -46.6934, 'Av. Roque Petroni Júnior, 1089 - Morumbi, São Paulo - SP', '+55 11 3552-2122', 'https://www.shoppingmorumbi.com.br', 4.7, '{"monday": "10:00-22:00", "tuesday": "10:00-22:00", "wednesday": "10:00-22:00", "thursday": "10:00-22:00", "friday": "10:00-22:00", "saturday": "10:00-22:00", "sunday": "14:00-20:00"}', '{"amenities": ["valet", "cinema", "restaurantes", "spa"], "luxury": true}', true, NOW(), NOW()),

-- Hospitais
('Hospital das Clínicas', 'hospital', 'Hospital universitário de referência em São Paulo', -23.5505, -46.6444, 'R. Dr. Ovídio Pires de Campos, 225 - Cerqueira César, São Paulo - SP', '+55 11 2661-0000', 'https://www.hc.fm.usp.br', 4.2, '{"monday": "24h", "tuesday": "24h", "wednesday": "24h", "thursday": "24h", "friday": "24h", "saturday": "24h", "sunday": "24h"}', '{"type": "public", "specialties": ["cardiologia", "neurologia", "oncologia", "emergency"], "beds": 2000}', true, NOW(), NOW()),

('Hospital Sírio-Libanês', 'hospital', 'Hospital privado de excelência em São Paulo', -23.5626, -46.6624, 'R. Dona Adma Jafet, 91 - Bela Vista, São Paulo - SP', '+55 11 3394-5000', 'https://www.hospitalsiriolibanes.org.br', 4.8, '{"monday": "24h", "tuesday": "24h", "wednesday": "24h", "thursday": "24h", "friday": "24h", "saturday": "24h", "sunday": "24h"}', '{"type": "private", "specialties": ["cardiologia", "oncologia", "neurocirurgia"], "premium": true}', true, NOW(), NOW()),

-- Restaurantes
('Restaurante DOM', 'restaurant', 'Restaurante premiado do chef Alex Atala', -23.5489, -46.6333, 'R. Barão de Capanema, 549 - Jardins, São Paulo - SP', '+55 11 3088-0761', 'https://www.domrestaurante.com.br', 4.9, '{"tuesday": "19:30-23:30", "wednesday": "19:30-23:30", "thursday": "19:30-23:30", "friday": "19:30-23:30", "saturday": "19:30-23:30", "sunday": "closed", "monday": "closed"}', '{"michelin_stars": 2, "cuisine": "brazilian_contemporary", "price_range": "$$$$"}', true, NOW(), NOW()),

('Pizzaria Bráz', 'restaurant', 'Famosa pizzaria tradicional paulistana', -23.5489, -46.6511, 'R. Graça Aranha, 356 - Moema, São Paulo - SP', '+55 11 5052-8484', 'https://www.pizzariabraz.com.br', 4.6, '{"monday": "18:00-01:00", "tuesday": "18:00-01:00", "wednesday": "18:00-01:00", "thursday": "18:00-01:00", "friday": "18:00-02:00", "saturday": "18:00-02:00", "sunday": "18:00-01:00"}', '{"cuisine": "pizza", "specialty": "margherita", "casual_dining": true}', true, NOW(), NOW()),

-- Postos de Gasolina
('Posto Shell - Faria Lima', 'gas_station', 'Posto de combustível 24h na Faria Lima', -23.5575, -46.6511, 'Av. Brigadeiro Faria Lima, 1571 - Jardim Paulistano, São Paulo - SP', '+55 11 3813-5200', 'https://www.shell.com.br', 4.0, '{"monday": "24h", "tuesday": "24h", "wednesday": "24h", "thursday": "24h", "friday": "24h", "saturday": "24h", "sunday": "24h"}', '{"services": ["combustivel", "lavagem", "conveniencia", "ar_comprimido"], "24h": true}', true, NOW(), NOW()),

('Posto Ipiranga - Paulista', 'gas_station', 'Posto estratégico na Avenida Paulista', -23.5618, -46.6565, 'Av. Paulista, 1842 - Bela Vista, São Paulo - SP', '+55 11 3251-8900', 'https://www.ipiranga.com.br', 4.1, '{"monday": "06:00-22:00", "tuesday": "06:00-22:00", "wednesday": "06:00-22:00", "thursday": "06:00-22:00", "friday": "06:00-22:00", "saturday": "06:00-22:00", "sunday": "07:00-20:00"}', '{"services": ["combustivel", "lavagem", "jet_oil", "conveniencia"], "premium_location": true}', true, NOW(), NOW()),

-- Parques
('Parque Ibirapuera', 'park', 'Principal parque urbano de São Paulo', -23.5478, -46.6566, 'Av. Paulista, s/n - Ibirapuera, São Paulo - SP', '+55 11 5574-5045', 'https://parqueibirapuera.org', 4.6, '{"monday": "05:00-24:00", "tuesday": "05:00-24:00", "wednesday": "05:00-24:00", "thursday": "05:00-24:00", "friday": "05:00-24:00", "saturday": "05:00-24:00", "sunday": "05:00-24:00"}', '{"area_hectares": 158, "activities": ["caminhada", "ciclismo", "museus", "playground"], "free_entry": true}', true, NOW(), NOW()),

('Parque Villa-Lobos', 'park', 'Parque moderno com ciclovia e área verde', -23.5441, -46.7189, 'Av. Prof. Fonseca Rodrigues, 2001 - Alto de Pinheiros, São Paulo - SP', '+55 11 2683-6302', null, 4.5, '{"monday": "05:30-19:00", "tuesday": "05:30-19:00", "wednesday": "05:30-19:00", "thursday": "05:30-19:00", "friday": "05:30-19:00", "saturday": "05:30-19:00", "sunday": "05:30-19:00"}', '{"area_hectares": 73, "activities": ["ciclismo", "caminhada", "playground", "anfiteatro"], "bike_rental": true}', true, NOW(), NOW()),

-- Bancos
('Banco do Brasil - Sé', 'bank', 'Agência principal do Banco do Brasil no centro', -23.5506, -46.6344, 'Pça. da Sé, 425 - Sé, São Paulo - SP', '+55 11 4004-0001', 'https://www.bb.com.br', 3.8, '{"monday": "10:00-16:00", "tuesday": "10:00-16:00", "wednesday": "10:00-16:00", "thursday": "10:00-16:00", "friday": "10:00-16:00", "saturday": "closed", "sunday": "closed"}', '{"services": ["conta_corrente", "emprestimos", "investimentos", "caixas_eletronicos"], "historic_building": true}', true, NOW(), NOW()),

('Itaú - Faria Lima', 'bank', 'Agência premium do Itaú na Faria Lima', -23.5626, -46.6914, 'Av. Brigadeiro Faria Lima, 3400 - Itaim Bibi, São Paulo - SP', '+55 11 4004-4828', 'https://www.itau.com.br', 4.1, '{"monday": "09:00-17:00", "tuesday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "09:00-17:00", "friday": "09:00-17:00", "saturday": "closed", "sunday": "closed"}', '{"services": ["private_banking", "investimentos", "empresarial"], "premium": true}', true, NOW(), NOW()),

-- Farmácias
('Drogasil - Paulista', 'pharmacy', 'Farmácia 24h na Avenida Paulista', -23.5636, -46.6542, 'Av. Paulista, 2073 - Consolação, São Paulo - SP', '+55 11 3253-9944', 'https://www.drogasil.com.br', 4.2, '{"monday": "24h", "tuesday": "24h", "wednesday": "24h", "thursday": "24h", "friday": "24h", "saturday": "24h", "sunday": "24h"}', '{"services": ["medicamentos", "cosmeticos", "perfumaria", "entrega"], "24h": true}', true, NOW(), NOW()),

('Drogaria São Paulo - Vila Madalena', 'pharmacy', 'Farmácia na movimentada Vila Madalena', -23.5542, -46.6947, 'R. Harmonia, 445 - Vila Madalena, São Paulo - SP', '+55 11 3813-7788', 'https://www.drogariasaopaulo.com.br', 4.0, '{"monday": "07:00-23:00", "tuesday": "07:00-23:00", "wednesday": "07:00-23:00", "thursday": "07:00-23:00", "friday": "07:00-23:00", "saturday": "08:00-22:00", "sunday": "08:00-20:00"}', '{"services": ["medicamentos", "manipulacao", "cosmeticos"], "prescription_delivery": true}', true, NOW(), NOW()),

-- Escolas
('USP - Universidade de São Paulo', 'school', 'Principal universidade pública do Brasil', -23.5591, -46.7319, 'Av. Prof. Lúcio Martins Rodrigues, 443 - Cidade Universitária, São Paulo - SP', '+55 11 3091-3600', 'https://www.usp.br', 4.7, '{"monday": "07:00-22:00", "tuesday": "07:00-22:00", "wednesday": "07:00-22:00", "thursday": "07:00-22:00", "friday": "07:00-22:00", "saturday": "08:00-18:00", "sunday": "closed"}', '{"type": "university", "students": 97000, "faculties": ["medicina", "engenharia", "direito", "economia"], "ranking": "top_1_brazil"}', true, NOW(), NOW()),

-- Hotéis
('Copacabana Hotel', 'hotel', 'Hotel tradicional no centro de São Paulo', -23.5439, -46.6395, 'Av. Nossa Senhora de Copacabana, 1059 - República, São Paulo - SP', '+55 11 3259-4177', 'https://www.copacabanahotel.com.br', 4.3, '{"monday": "24h", "tuesday": "24h", "wednesday": "24h", "thursday": "24h", "friday": "24h", "saturday": "24h", "sunday": "24h"}', '{"stars": 4, "rooms": 120, "amenities": ["wifi", "breakfast", "business_center", "parking"], "business_oriented": true}', true, NOW(), NOW());

-- Atualizar contador de sequência se necessário
SELECT setval('pois_id_seq', (SELECT MAX(id) FROM pois));

-- Criar índices para melhor performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_pois_location ON pois USING GIST (ST_Point(longitude, latitude));
CREATE INDEX IF NOT EXISTS idx_pois_category ON pois (category);
CREATE INDEX IF NOT EXISTS idx_pois_user_id ON pois (user_id);
CREATE INDEX IF NOT EXISTS idx_pois_deleted_at ON pois (deleted_at);

-- Verificar inserção
SELECT 
  category,
  COUNT(*) as count,
  AVG(rating) as avg_rating
FROM pois 
WHERE deleted_at IS NULL AND user_id IS NULL
GROUP BY category 
ORDER BY count DESC;
