-- ========================================
-- DATABASE SCHEMA - VIWE PLATFORM
-- ========================================
-- Version: 1.0.0
-- Tables: 19
-- ========================================

-- Drop tables in reverse order of creation to handle dependencies
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "system_config" CASCADE;
DROP TABLE IF EXISTS "search_results" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "payment_history" CASCADE;
DROP TABLE IF EXISTS "subscriptions" CASCADE;
DROP TABLE IF EXISTS "plans" CASCADE;
DROP TABLE IF EXISTS "pois" CASCADE;
DROP TABLE IF EXISTS "client_stops" CASCADE;
DROP TABLE IF EXISTS "clients" CASCADE;
DROP TABLE IF EXISTS "route_metrics" CASCADE;
DROP TABLE IF EXISTS "navigation_sessions" CASCADE;
DROP TABLE IF EXISTS "route_sets" CASCADE;
DROP TABLE IF EXISTS "route_stops" CASCADE;
DROP TABLE IF EXISTS "routes" CASCADE;
DROP TABLE IF EXISTS "user_stats" CASCADE;
DROP TABLE IF EXISTS "user_preferences" CASCADE;
DROP TABLE IF EXISTS "auth_sessions" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- ========================================
-- 1. USERS AND AUTHENTICATION
-- ========================================

CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password_hash" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(50),
  "company" VARCHAR(255),
  "country" VARCHAR(100),
  "city" VARCHAR(100),
  "avatar_url" TEXT,
  "plan_type" VARCHAR(50) DEFAULT 'basic',
  "plan_expires_at" TIMESTAMP,
  "is_active" BOOLEAN DEFAULT true,
  "is_email_verified" BOOLEAN DEFAULT false,
  "last_login_at" TIMESTAMP,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE "auth_sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "refresh_token" TEXT,
  "refresh_token_hash" TEXT,
  "is_active" BOOLEAN DEFAULT true,
  "expires_at" TIMESTAMP WITH TIME ZONE,
  "user_agent" TEXT,
  "ip_address" INET,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "user_preferences" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "theme" VARCHAR(50) DEFAULT 'dark',
  "language" VARCHAR(10) DEFAULT 'pt-BR',
  "push_notifications" BOOLEAN DEFAULT true,
  "email_notifications" BOOLEAN DEFAULT true,
  "font_size" VARCHAR(20) DEFAULT 'medium',
  "density" VARCHAR(20) DEFAULT 'comfortable',
  "default_map_mode" VARCHAR(50) DEFAULT 'hybrid',
  "offline_maps_enabled" BOOLEAN DEFAULT false,
  "auto_night_mode" BOOLEAN DEFAULT true,
  "voice_guidance" BOOLEAN DEFAULT true,
  "route_optimization_mode" VARCHAR(50) DEFAULT 'time',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "user_stats" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "total_routes" INTEGER DEFAULT 0,
  "completed_routes" INTEGER DEFAULT 0,
  "total_distance" DECIMAL(10, 2) DEFAULT 0,
  "total_time_saved" INTEGER DEFAULT 0,
  "total_fuel_saved" DECIMAL(10, 2) DEFAULT 0,
  "average_rating" DECIMAL(3, 2) DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. ROUTES AND NAVIGATION
-- ========================================

CREATE TABLE "route_sets" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "color" VARCHAR(7),
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "routes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "responsible" VARCHAR(255),
  "priority" VARCHAR(50) DEFAULT 'medium',
  "status" VARCHAR(50) DEFAULT 'draft',
  "route_type" VARCHAR(50) DEFAULT 'logistics',
  "scheduled_date" TIMESTAMP WITH TIME ZONE,
  "started_at" TIMESTAMP WITH TIME ZONE,
  "completed_at" TIMESTAMP WITH TIME ZONE,
  "is_favorite" BOOLEAN DEFAULT false,
  "route_set_id" UUID REFERENCES "route_sets"("id") ON DELETE SET NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE "clients" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255),
  "phone" VARCHAR(50),
  "company" VARCHAR(255),
  "address" TEXT,
  "city" VARCHAR(100),
  "state" VARCHAR(100),
  "country" VARCHAR(100),
  "latitude" DECIMAL(9, 6),
  "longitude" DECIMAL(9, 6),
  "notes" TEXT,
  "tags" TEXT[],
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE "route_stops" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "route_id" UUID NOT NULL REFERENCES "routes"("id") ON DELETE CASCADE,
  "stop_order" INTEGER NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "address" TEXT,
  "latitude" DECIMAL(9, 6) NOT NULL,
  "longitude" DECIMAL(9, 6) NOT NULL,
  "client_id" UUID REFERENCES "clients"("id") ON DELETE SET NULL,
  "estimated_duration" INTEGER,
  "is_completed" BOOLEAN DEFAULT false,
  "completed_at" TIMESTAMP WITH TIME ZONE,
  "time_spent_at_stop" INTEGER,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "navigation_sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "route_id" UUID NOT NULL REFERENCES "routes"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" VARCHAR(50) DEFAULT 'active',
  "navigation_mode" VARCHAR(50) DEFAULT 'driving',
  "start_time" TIMESTAMP WITH TIME ZONE,
  "end_time" TIMESTAMP WITH TIME ZONE,
  "current_stop_index" INTEGER DEFAULT 0,
  "current_latitude" DECIMAL(9, 6),
  "current_longitude" DECIMAL(9, 6),
  "total_distance" DECIMAL(10, 2),
  "remaining_distance" DECIMAL(10, 2),
  "active_time" INTEGER DEFAULT 0,
  "estimated_fuel_consumption" DECIMAL(10, 2),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "route_metrics" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "route_id" UUID NOT NULL REFERENCES "routes"("id") ON DELETE CASCADE,
  "total_distance" DECIMAL(10, 2),
  "estimated_duration" INTEGER,
  "actual_duration" INTEGER,
  "fuel_consumption" DECIMAL(10, 2),
  "fuel_savings" DECIMAL(10, 2),
  "time_savings" INTEGER,
  "average_speed" DECIMAL(5, 2),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. CLIENTS
-- ========================================

CREATE TABLE "client_stops" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_id" UUID NOT NULL REFERENCES "clients"("id") ON DELETE CASCADE,
  "route_id" UUID NOT NULL REFERENCES "routes"("id") ON DELETE CASCADE,
  "visited_at" TIMESTAMP WITH TIME ZONE,
  "duration" INTEGER,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. POIS
-- ========================================

CREATE TABLE "pois" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "name" VARCHAR(255) NOT NULL,
  "type" VARCHAR(100),
  "description" TEXT,
  "latitude" DECIMAL(9, 6) NOT NULL,
  "longitude" DECIMAL(9, 6) NOT NULL,
  "address" TEXT,
  "phone" VARCHAR(50),
  "website" VARCHAR(255),
  "business_hours" JSONB,
  "metadata" JSONB,
  "rating" DECIMAL(2, 1) DEFAULT 0,
  "is_verified" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- 5. BILLING AND PAYMENTS
-- ========================================

CREATE TABLE "plans" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "price_cents" INTEGER NOT NULL,
  "currency" VARCHAR(3) DEFAULT 'BRL',
  "billing_period" VARCHAR(50) DEFAULT 'monthly',
  "routes_limit" INTEGER,
  "api_calls_limit" INTEGER,
  "features" JSONB,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "subscriptions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "plan_id" UUID NOT NULL REFERENCES "plans"("id"),
  "stripe_subscription_id" VARCHAR(255),
  "status" VARCHAR(50) NOT NULL,
  "start_date" TIMESTAMP WITH TIME ZONE,
  "end_date" TIMESTAMP WITH TIME ZONE,
  "cancelled_at" TIMESTAMP WITH TIME ZONE,
  "amount_cents" INTEGER,
  "currency" VARCHAR(3) DEFAULT 'BRL',
  "billing_period" VARCHAR(50),
  "routes_limit" INTEGER,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "payment_history" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "subscription_id" UUID REFERENCES "subscriptions"("id") ON DELETE SET NULL,
  "stripe_payment_intent_id" VARCHAR(255),
  "amount_cents" INTEGER NOT NULL,
  "currency" VARCHAR(3) DEFAULT 'BRL',
  "status" VARCHAR(50) NOT NULL,
  "payment_method" VARCHAR(100),
  "description" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. NOTIFICATIONS
-- ========================================

CREATE TABLE "notifications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" VARCHAR(50) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "details" JSONB,
  "read_at" TIMESTAMP WITH TIME ZONE,
  "archived_at" TIMESTAMP WITH TIME ZONE,
  "actionable" BOOLEAN DEFAULT false,
  "action_url" VARCHAR(255),
  "action_label" VARCHAR(100),
  "route_id" UUID REFERENCES "routes"("id") ON DELETE SET NULL,
  "navigation_session_id" UUID REFERENCES "navigation_sessions"("id") ON DELETE SET NULL,
  "icon" VARCHAR(100),
  "color" VARCHAR(7),
  "priority" VARCHAR(50) DEFAULT 'normal',
  "expires_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- 7. SYSTEM AND AUDIT
-- ========================================

CREATE TABLE "search_results" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "query" VARCHAR(255) NOT NULL,
  "results" JSONB,
  "source" VARCHAR(100),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "expires_at" TIMESTAMP WITH TIME ZONE
);

CREATE TABLE "system_config" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" VARCHAR(255) UNIQUE NOT NULL,
  "value" JSONB,
  "description" TEXT,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "audit_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "action" VARCHAR(255) NOT NULL,
  "entity_type" VARCHAR(100),
  "table_name" VARCHAR(100),
  "record_id" UUID,
  "old_values" JSONB,
  "new_values" JSONB,
  "ip_address" INET,
  "user_agent" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_routes_user_id ON routes(user_id);
CREATE INDEX idx_route_stops_route_id ON route_stops(route_id);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_pois_type ON pois(type);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_audit_logs_user_id_action ON audit_logs(user_id, action);
