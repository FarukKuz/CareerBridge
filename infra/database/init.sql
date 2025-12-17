CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE IF NOT EXISTS fleets (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    manager_id BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'Driver',
    fleet_id BIGINT REFERENCES fleets(id),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone_number VARCHAR(20) UNIQUE,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL UNIQUE,
    fleet_id BIGINT NOT NULL REFERENCES fleets(id),
    model VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    vehicle_type VARCHAR(20) DEFAULT 'Truck',
    horsepower SMALLINT,
    current_driver_id BIGINT REFERENCES users(id),
    last_known_lat DOUBLE PRECISION,
    last_known_lon DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT NOT NULL REFERENCES users(id),
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicle_telemetry (
    time TIMESTAMPTZ NOT NULL,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed SMALLINT,
    engine_temp SMALLINT,
    fuel_level SMALLINT,
    heading SMALLINT,
    metadata JSONB
);

SELECT create_hypertable('vehicle_telemetry', 'time', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_telemetry_vehicle_time ON vehicle_telemetry (vehicle_id, time DESC);

CREATE TABLE IF NOT EXISTS alert_rules (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    fleet_id BIGINT REFERENCES fleets(id),
    rule_type VARCHAR(30) NOT NULL,
    rule_json JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS alert_history (
    id BIGSERIAL PRIMARY KEY,
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id),
    alert_rule_id BIGINT NOT NULL REFERENCES alert_rules(id),
    triggered_value FLOAT,
    severity VARCHAR(20),
    status VARCHAR(20) DEFAULT 'New'
);

CREATE TABLE IF NOT EXISTS geofences (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    fleet_id BIGINT REFERENCES fleets(id),
    area JSONB NOT NULL,
    type VARCHAR(20) DEFAULT 'Restriction'
);