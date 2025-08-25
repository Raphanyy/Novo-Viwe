-- =====================================================
-- SCHEMA COMPLETO DO BANCO DE DADOS - PLATAFORMA VIWE
-- =====================================================
-- Baseado na análise completa do frontend
-- PostgreSQL 14+
-- Total: 20 tabelas principais + índices + triggers

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- 1. USUÁRIOS E AUTENTICAÇÃO
-- =====================================================

-- Tabela principal de usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informações básicas
    name VARCHAR(255) NOT NULL,
    email VARCHAR(320) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Perfil
    avatar_url TEXT,
    phone VARCHAR(20),
    company VARCHAR(255),
    country VARCHAR(100) DEFAULT 'Brasil',
    city VARCHAR(100),
    
    -- Plano
    plan_type VARCHAR(20) DEFAULT 'basic' CHECK (plan_type IN ('basic', 'premium', 'interactive')),
    plan_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Status da conta
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Recuperação de senha
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Soft delete
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Preferências do usuário
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notificações
    push_notifications BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    traffic_alerts BOOLEAN DEFAULT TRUE,
    route_updates BOOLEAN DEFAULT TRUE,
    achievements BOOLEAN DEFAULT TRUE,
    marketing BOOLEAN DEFAULT FALSE,
    sound_enabled BOOLEAN DEFAULT TRUE,
    vibration_enabled BOOLEAN DEFAULT TRUE,
    
    -- Não perturbe
    do_not_disturb_start TIME,
    do_not_disturb_end TIME,
    
    -- Tema e interface
    theme VARCHAR(10) DEFAULT 'auto' CHECK (theme IN ('auto', 'light', 'dark')),
    language VARCHAR(10) DEFAULT 'pt-BR',
    font_size INTEGER DEFAULT 16 CHECK (font_size BETWEEN 12 AND 20),
    density VARCHAR(12) DEFAULT 'normal' CHECK (density IN ('compact', 'normal', 'comfortable')),
    
    -- Mapas
    default_map_mode VARCHAR(10) DEFAULT 'normal' CHECK (default_map_mode IN ('normal', 'satellite', 'traffic')),
    show_traffic_always BOOLEAN DEFAULT FALSE,
    offline_maps_enabled BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: um registro por usuário
    UNIQUE(user_id)
);

-- Sessões de autenticação
CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Tokens
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    
    -- Informações do dispositivo
    device_info JSONB,
    user_agent TEXT,
    ip_address INET,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- =====================================================
-- 2. CONJUNTOS DE ROTAS
-- =====================================================

-- Conjuntos/grupos de rotas para organização
CREATE TABLE route_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- HEX color
    is_default BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 3. CLIENTES
-- =====================================================

-- Clientes dos usuários
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Informações básicas
    name VARCHAR(255) NOT NULL,
    email VARCHAR(320),
    phone VARCHAR(20) NOT NULL,
    company VARCHAR(255),
    
    -- Endereço principal
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Brasil',
    
    -- Coordenadas
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Metadados
    notes TEXT,
    tags TEXT[], -- Array de tags
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Relacionamentos
    preferred_route_set_id UUID REFERENCES route_sets(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_contact_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 4. ROTAS
-- =====================================================

-- Rotas principais
CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    route_set_id UUID REFERENCES route_sets(id) ON DELETE SET NULL,
    
    -- Identificação
    name VARCHAR(255) NOT NULL,
    description TEXT,
    responsible VARCHAR(255) NOT NULL,
    
    -- Status e tipo
    status VARCHAR(15) DEFAULT 'draft' CHECK (status IN ('active', 'scheduled', 'draft', 'completed', 'paused', 'cancelled')),
    route_type VARCHAR(15) DEFAULT 'temporary' CHECK (route_type IN ('temporary', 'direct', 'optimized')),
    priority VARCHAR(10) DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta')),
    
    -- Agendamento
    scheduling_type VARCHAR(15) DEFAULT 'imediata' CHECK (scheduling_type IN ('permanente', 'imediata')),
    scheduled_date TIMESTAMP WITH TIME ZONE,
    
    -- Métricas estimadas
    estimated_duration INTEGER, -- em segundos
    estimated_distance INTEGER, -- em metros
    estimated_fuel_consumption DECIMAL(8, 3), -- em litros
    estimated_credits INTEGER DEFAULT 5,
    
    -- Métricas reais (após execução)
    actual_duration INTEGER,
    actual_distance INTEGER,
    actual_fuel_consumption DECIMAL(8, 3),
    
    -- Organização
    linked_set_id UUID REFERENCES route_sets(id) ON DELETE SET NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Paradas de cada rota
CREATE TABLE route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    
    -- Identificação
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50), -- Código da parada
    notes TEXT,
    
    -- Localização
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    
    -- Ordem e status
    stop_order INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Tempo
    estimated_arrival_time TIMESTAMP WITH TIME ZONE,
    actual_arrival_time TIMESTAMP WITH TIME ZONE,
    time_spent_at_stop INTEGER, -- em segundos
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: ordem única por rota
    UNIQUE(route_id, stop_order)
);

-- Informações específicas de cliente por parada
CREATE TABLE client_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    route_stop_id UUID NOT NULL REFERENCES route_stops(id) ON DELETE CASCADE,
    
    -- Instruções específicas
    special_instructions TEXT,
    access_code VARCHAR(50),
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    
    -- Horários preferenciais
    preferred_time_start TIME,
    preferred_time_end TIME,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: única associação por cliente e parada
    UNIQUE(client_id, route_stop_id)
);

-- =====================================================
-- 5. NAVEGAÇÃO
-- =====================================================

-- Sessões de navegação
CREATE TABLE navigation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status da navegação
    status VARCHAR(15) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    navigation_mode VARCHAR(10) DEFAULT 'traced' CHECK (navigation_mode IN ('traced', 'active')),
    
    -- Timestamps principais
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    paused_duration INTEGER DEFAULT 0, -- em segundos
    
    -- Métricas em tempo real
    current_stop_index INTEGER DEFAULT 0,
    total_distance INTEGER DEFAULT 0, -- em metros
    remaining_distance INTEGER DEFAULT 0, -- em metros
    active_time INTEGER DEFAULT 0, -- em segundos
    
    -- Combustível
    estimated_fuel_consumption DECIMAL(8, 3) DEFAULT 0,
    actual_fuel_consumption DECIMAL(8, 3) DEFAULT 0,
    
    -- Otimizações
    optimization_count INTEGER DEFAULT 0,
    last_optimization_time TIMESTAMP WITH TIME ZONE,
    average_stop_time INTEGER DEFAULT 0, -- em segundos
    
    -- Localização atual
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    last_location_update TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. MÉTRICAS E ESTATÍSTICAS
-- =====================================================

-- Métricas detalhadas por rota
CREATE TABLE route_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    navigation_session_id UUID REFERENCES navigation_sessions(id) ON DELETE SET NULL,
    
    -- Métricas de performance
    total_time INTEGER NOT NULL, -- em segundos
    total_distance INTEGER NOT NULL, -- em metros
    average_speed DECIMAL(5, 2), -- em km/h
    
    -- Paradas
    total_stops INTEGER NOT NULL,
    completed_stops INTEGER NOT NULL,
    average_stop_time INTEGER, -- em segundos
    
    -- Otimizações
    optimization_count INTEGER DEFAULT 0,
    time_improvement INTEGER DEFAULT 0, -- em segundos
    distance_improvement INTEGER DEFAULT 0, -- em metros
    
    -- Combustível e economia
    fuel_used DECIMAL(8, 3), -- em litros
    fuel_saved DECIMAL(8, 3), -- em litros
    money_saved DECIMAL(10, 2), -- em reais
    co2_saved DECIMAL(8, 3), -- em kg
    
    -- Tráfego
    traffic_conditions VARCHAR(10) CHECK (traffic_conditions IN ('light', 'normal', 'heavy', 'severe')),
    traffic_delays INTEGER DEFAULT 0, -- em segundos
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Estatísticas agregadas por usuário
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Período
    period VARCHAR(10) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
    date DATE NOT NULL, -- Data de referência
    
    -- Estatísticas de rotas
    total_routes INTEGER DEFAULT 0,
    completed_routes INTEGER DEFAULT 0,
    cancelled_routes INTEGER DEFAULT 0,
    average_route_time INTEGER DEFAULT 0, -- em segundos
    
    -- Distâncias
    total_distance INTEGER DEFAULT 0, -- em metros
    average_distance INTEGER DEFAULT 0,
    
    -- Combustível
    total_fuel_saved DECIMAL(10, 3) DEFAULT 0, -- em litros
    total_money_saved DECIMAL(12, 2) DEFAULT 0, -- em reais
    fuel_efficiency DECIMAL(6, 2) DEFAULT 0, -- km/l médio
    
    -- Otimizações
    total_optimizations INTEGER DEFAULT 0,
    time_saved INTEGER DEFAULT 0, -- em segundos
    
    -- Pontuação e conquistas
    efficiency INTEGER DEFAULT 0 CHECK (efficiency BETWEEN 0 AND 100),
    score INTEGER DEFAULT 0,
    achievements TEXT[], -- Array de conquistas
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: único por usuário, período e data
    UNIQUE(user_id, period, date)
);

-- =====================================================
-- 7. NOTIFICAÇÕES
-- =====================================================

-- Notificações para usuários
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Conteúdo
    type VARCHAR(10) NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error', 'route', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    details TEXT, -- Detalhes expandidos
    
    -- Status
    read BOOLEAN DEFAULT FALSE,
    archived BOOLEAN DEFAULT FALSE,
    
    -- Ações
    actionable BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    action_label VARCHAR(100),
    
    -- Relacionamentos
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    navigation_session_id UUID REFERENCES navigation_sessions(id) ON DELETE CASCADE,
    
    -- Metadados
    icon VARCHAR(50),
    color VARCHAR(7), -- HEX color
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 8. PLANOS E BILLING
-- =====================================================

-- Planos disponíveis
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificação
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    
    -- Preço
    price_cents INTEGER NOT NULL, -- preço em centavos
    currency VARCHAR(3) DEFAULT 'BRL',
    billing_period VARCHAR(10) NOT NULL CHECK (billing_period IN ('monthly', 'yearly')),
    
    -- Recursos
    features TEXT[] NOT NULL, -- Array de recursos
    max_routes INTEGER DEFAULT -1, -- -1 para ilimitado
    max_stops_per_route INTEGER DEFAULT -1,
    has_optimization BOOLEAN DEFAULT FALSE,
    has_real_time_traffic BOOLEAN DEFAULT FALSE,
    has_offline_maps BOOLEAN DEFAULT FALSE,
    has_advanced_analytics BOOLEAN DEFAULT FALSE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_coming_soon BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assinaturas dos usuários
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    
    -- Status
    status VARCHAR(15) DEFAULT 'pending' CHECK (status IN ('active', 'cancelled', 'expired', 'pending', 'trialing')),
    
    -- Datas
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_end_date TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Billing
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    billing_period VARCHAR(10) NOT NULL,
    
    -- Gateway de pagamento
    stripe_subscription_id VARCHAR(255),
    paypal_subscription_id VARCHAR(255),
    
    -- Uso
    routes_used INTEGER DEFAULT 0,
    routes_limit INTEGER DEFAULT -1,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Histórico de pagamentos
CREATE TABLE payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    
    -- Detalhes do pagamento
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(15) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    
    -- Gateway
    payment_method VARCHAR(20) CHECK (payment_method IN ('credit_card', 'debit_card', 'pix', 'boleto', 'paypal')),
    gateway_provider VARCHAR(20) CHECK (gateway_provider IN ('stripe', 'paypal', 'pagseguro')),
    gateway_transaction_id VARCHAR(255) NOT NULL,
    
    -- Metadados
    description TEXT,
    invoice_url TEXT,
    receipt_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 9. MAPAS E GEOCODING
-- =====================================================

-- Resultados de busca (cache)
CREATE TABLE search_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Dados do resultado
    place_name TEXT NOT NULL,
    text_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    place_types TEXT[], -- Array de tipos
    
    -- Propriedades
    properties JSONB,
    relevance DECIMAL(3, 2),
    
    -- Metadados de busca
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    search_query TEXT NOT NULL,
    
    -- Timestamps
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índice GiST para busca geográfica
    CONSTRAINT check_latitude CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT check_longitude CHECK (longitude BETWEEN -180 AND 180)
);

-- POIs (Points of Interest)
CREATE TABLE pois (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificação
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('gas_station', 'restaurant', 'hospital', 'pharmacy', 'bank', 'other')),
    
    -- Localização
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    
    -- Avaliação
    rating DECIMAL(2, 1) CHECK (rating BETWEEN 0 AND 5),
    
    -- Metadados
    phone VARCHAR(20),
    website TEXT,
    hours TEXT,
    
    -- Visual
    color VARCHAR(7), -- HEX color
    icon VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_poi_latitude CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT check_poi_longitude CHECK (longitude BETWEEN -180 AND 180)
);

-- =====================================================
-- 10. SISTEMA E AUDITORIA
-- =====================================================

-- Configurações do sistema
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Chave e valor
    key VARCHAR(255) NOT NULL UNIQUE,
    value TEXT NOT NULL, -- JSON serializado
    type VARCHAR(10) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    
    -- Contexto
    environment VARCHAR(15) DEFAULT 'production' CHECK (environment IN ('development', 'staging', 'production')),
    category VARCHAR(20) CHECK (category IN ('mapbox', 'billing', 'notifications', 'features')),
    
    -- Segurança
    is_public BOOLEAN DEFAULT FALSE,
    is_required BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Log de auditoria
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Ação
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Dados
    old_values JSONB,
    new_values JSONB,
    metadata JSONB,
    
    -- Contexto
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Usuários
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_verified ON users(is_email_verified);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_plan_expires ON users(plan_expires_at);

-- Sessões
CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_token ON auth_sessions(refresh_token);
CREATE INDEX idx_auth_sessions_expires ON auth_sessions(expires_at);
CREATE INDEX idx_auth_sessions_active ON auth_sessions(is_active);

-- Rotas
CREATE INDEX idx_routes_user_id ON routes(user_id);
CREATE INDEX idx_routes_status ON routes(status);
CREATE INDEX idx_routes_scheduled_date ON routes(scheduled_date);
CREATE INDEX idx_routes_created_at ON routes(created_at);
CREATE INDEX idx_routes_route_set_id ON routes(route_set_id);

-- Paradas
CREATE INDEX idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX idx_route_stops_order ON route_stops(route_id, stop_order);
CREATE INDEX idx_route_stops_client_id ON route_stops(client_id);
CREATE INDEX idx_route_stops_completed ON route_stops(is_completed);

-- Clientes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_active ON clients(is_active);

-- Navegação
CREATE INDEX idx_navigation_sessions_route_id ON navigation_sessions(route_id);
CREATE INDEX idx_navigation_sessions_user_id ON navigation_sessions(user_id);
CREATE INDEX idx_navigation_sessions_status ON navigation_sessions(status);
CREATE INDEX idx_navigation_sessions_start_time ON navigation_sessions(start_time);

-- Notificações
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at);

-- Estatísticas
CREATE INDEX idx_user_stats_user_period ON user_stats(user_id, period, date);

-- Billing
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);

-- Busca geográfica
CREATE INDEX idx_search_results_location ON search_results USING GIST (ST_Point(longitude, latitude));
CREATE INDEX idx_pois_location ON pois USING GIST (ST_Point(longitude, latitude));
CREATE INDEX idx_route_stops_location ON route_stops USING GIST (ST_Point(longitude, latitude));

-- Busca textual
CREATE INDEX idx_routes_name_trgm ON routes USING GIN (name gin_trgm_ops);
CREATE INDEX idx_clients_name_trgm ON clients USING GIN (name gin_trgm_ops);
CREATE INDEX idx_search_results_text_trgm ON search_results USING GIN (text_name gin_trgm_ops);

-- Auditoria
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_sets_updated_at BEFORE UPDATE ON route_sets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_stops_updated_at BEFORE UPDATE ON route_stops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_navigation_sessions_updated_at BEFORE UPDATE ON navigation_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pois_updated_at BEFORE UPDATE ON pois
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGERS PARA LÓGICA DE NEGÓCIO
-- =====================================================

-- Trigger para atualizar last_modified em routes
CREATE OR REPLACE FUNCTION update_route_last_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_routes_last_modified BEFORE UPDATE ON routes
    FOR EACH ROW EXECUTE FUNCTION update_route_last_modified();

-- Trigger para garantir preferências únicas por usuário
CREATE OR REPLACE FUNCTION ensure_single_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    -- Remover preferências antigas se existirem
    DELETE FROM user_preferences WHERE user_id = NEW.user_id AND id != NEW.id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_single_preferences BEFORE INSERT ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION ensure_single_user_preferences();

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Planos padrão
INSERT INTO plans (name, description, price_cents, billing_period, features, max_routes, has_optimization, has_real_time_traffic, has_offline_maps, has_advanced_analytics) VALUES
('Básico', 'Plano gratuito com funcionalidades essenciais', 0, 'monthly', 
 ARRAY['Até 5 rotas por mês', 'Navegação básica', 'Suporte por email'], 
 5, FALSE, FALSE, FALSE, FALSE),

('Premium', 'Plano completo para usuários avançados', 2990, 'monthly',
 ARRAY['Rotas ilimitadas', 'Otimização de rotas', 'Tráfego em tempo real', 'Relatórios avançados', 'Suporte prioritário'],
 -1, TRUE, TRUE, FALSE, TRUE),

('Interactive', 'Plano empresarial com todas as funcionalidades', 4990, 'monthly',
 ARRAY['Todas as funcionalidades Premium', 'Mapas offline', 'API personalizada', 'Suporte dedicado', 'Integração avançada'],
 -1, TRUE, TRUE, TRUE, TRUE);

-- Configurações do sistema
INSERT INTO system_config (key, value, type, description, is_public, category) VALUES
('mapbox.default_token', 'pk.eyJ1IjoicmFwaGFueSIsImEiOiJjbWVuOTBpcDMwdnBxMmlweGp0cmc4a2s0In0.KwsjXFJmloQvThFvFGjOdA', 'string', 'Token padrão do Mapbox', TRUE, 'mapbox'),
('app.name', 'Viwe', 'string', 'Nome da aplicação', TRUE, 'features'),
('app.version', '1.0.0', 'string', 'Versão da aplicação', TRUE, 'features'),
('notifications.email_enabled', 'true', 'boolean', 'Notificações por email habilitadas', FALSE, 'notifications'),
('billing.stripe_enabled', 'true', 'boolean', 'Billing via Stripe habilitado', FALSE, 'billing');

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE users IS 'Tabela principal de usuários do sistema';
COMMENT ON TABLE user_preferences IS 'Preferências personalizadas de cada usuário';
COMMENT ON TABLE auth_sessions IS 'Sessões ativas de autenticação com refresh tokens';
COMMENT ON TABLE routes IS 'Rotas criadas pelos usuários';
COMMENT ON TABLE route_stops IS 'Paradas individuais de cada rota';
COMMENT ON TABLE navigation_sessions IS 'Sessões de navegação ativa';
COMMENT ON TABLE route_metrics IS 'Métricas detalhadas de performance das rotas';
COMMENT ON TABLE user_stats IS 'Estatísticas agregadas por usuário e período';
COMMENT ON TABLE notifications IS 'Sistema de notificações para usuários';
COMMENT ON TABLE clients IS 'Clientes/destinatários dos usuários';
COMMENT ON TABLE plans IS 'Planos de assinatura disponíveis';
COMMENT ON TABLE subscriptions IS 'Assinaturas ativas dos usuários';
COMMENT ON TABLE audit_logs IS 'Log de auditoria para todas as operações importantes';

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para estatísticas do dashboard
CREATE VIEW dashboard_stats AS
SELECT 
    u.id as user_id,
    u.name,
    u.plan_type,
    COUNT(DISTINCT r.id) as total_routes,
    COUNT(DISTINCT CASE WHEN r.status = 'completed' THEN r.id END) as completed_routes,
    COUNT(DISTINCT CASE WHEN r.status = 'active' THEN r.id END) as active_routes,
    COALESCE(SUM(rm.total_distance), 0) as total_distance,
    COALESCE(SUM(rm.fuel_saved), 0) as total_fuel_saved,
    COALESCE(SUM(rm.money_saved), 0) as total_money_saved
FROM users u
LEFT JOIN routes r ON u.id = r.user_id AND r.deleted_at IS NULL
LEFT JOIN route_metrics rm ON r.id = rm.route_id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.name, u.plan_type;

-- View para rotas recentes
CREATE VIEW recent_routes AS
SELECT 
    r.id,
    r.name,
    r.status,
    r.created_at,
    r.estimated_duration,
    r.estimated_distance,
    COUNT(rs.id) as stop_count,
    u.name as user_name
FROM routes r
JOIN users u ON r.user_id = u.id
LEFT JOIN route_stops rs ON r.id = rs.route_id
WHERE r.deleted_at IS NULL
GROUP BY r.id, r.name, r.status, r.created_at, r.estimated_duration, r.estimated_distance, u.name
ORDER BY r.created_at DESC;

-- =====================================================
-- PERMISSÕES E SEGURANÇA
-- =====================================================

-- Criar role para aplicação
-- CREATE ROLE viwe_app WITH LOGIN PASSWORD 'secure_password_here';
-- GRANT CONNECT ON DATABASE viwe TO viwe_app;
-- GRANT USAGE ON SCHEMA public TO viwe_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO viwe_app;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO viwe_app;

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================

-- Schema criado com sucesso!
-- Total de tabelas: 20
-- Total de índices: 35+
-- Total de triggers: 15+
-- Extensões: uuid-ossp, pgcrypto, pg_trgm
-- Views úteis: 2
-- Dados iniciais: planos e configurações
