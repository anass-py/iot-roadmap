import psycopg
from iot.config import DATABASE_URL

with psycopg.connect(DATABASE_URL, autocommit=True) as conn:
    with conn.cursor() as cur:
        cur.execute("CREATE EXTENSION IF NOT EXISTS timescaledb;")

        cur.execute("DROP MATERIALIZED VIEW IF EXISTS readings_hourly;")
        cur.execute("DROP TABLE IF EXISTS readings;")
        cur.execute("DROP TABLE IF EXISTS sensors;")
        cur.execute("DROP TABLE IF EXISTS devices;")

        cur.execute("""CREATE TABLE devices (
            id TEXT PRIMARY KEY, model TEXT, location TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now());""")

        cur.execute("""CREATE TABLE sensors (
            id TEXT PRIMARY KEY,
            device_id TEXT NOT NULL REFERENCES devices(id),
            type TEXT NOT NULL, unit TEXT NOT NULL);""")

        cur.execute("""CREATE TABLE readings (
            id BIGSERIAL,
            sensor_id TEXT NOT NULL REFERENCES sensors(id),
            value DOUBLE PRECISION NOT NULL,
            ts TIMESTAMPTZ NOT NULL,
            received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            PRIMARY KEY (id, ts));""")

        cur.execute("""CREATE INDEX idx_readings_sensor_ts
            ON readings (sensor_id, ts DESC);""")

        cur.execute("SELECT create_hypertable('readings', 'ts');")

        cur.execute("""CREATE MATERIALIZED VIEW readings_hourly
            WITH (timescaledb.continuous) AS
            SELECT sensor_id, time_bucket('1 hour', ts) AS heure, AVG(value) AS moyenne
            FROM readings GROUP BY sensor_id, heure;""")

        cur.execute("SELECT add_retention_policy('readings', INTERVAL '30 days');")

        
        print("schéma complet créé")