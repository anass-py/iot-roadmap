from datetime import datetime
from typing import Optional

import psycopg
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel

from iot.config import API_KEY, DATABASE_URL


class SensorConfig(BaseModel):
    interval_seconds: int
    enabled: bool
    threshold: float


app = FastAPI()
conn = psycopg.connect(DATABASE_URL, autocommit=True)


# ---------- SÉCURITÉ ----------

def verifier_cle(x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="clé d'API invalide")


# ---------- API ----------

@app.get("/health")
def health():
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1;")
            cur.fetchone()
        db_ok = True
    except Exception:
        db_ok = False

    status = "ok" if db_ok else "degraded"
    return {"status": status, "database": "up" if db_ok else "down"}


@app.get("/sensors/latest")
def latest():
    with conn.cursor() as cur:
        cur.execute("""
            SELECT DISTINCT ON (sensor_id) sensor_id, value, ts
            FROM readings
            ORDER BY sensor_id, ts DESC;
        """)
        return [{"sensor_id": r[0], "value": r[1], "ts": r[2]} for r in cur.fetchall()]


@app.post("/sensors/{sensor_id}/config")
def set_config(sensor_id: str, config: SensorConfig):
    return {"sensor_id": sensor_id, "config_recue": config}


@app.get("/readings", dependencies=[Depends(verifier_cle)])
def get_readings(
    sensor_id: str,
    depuis: Optional[datetime] = None,
    limit: int = 100,
    offset: int = 0,
):
    limit = min(limit, 1000)

    sql = "SELECT sensor_id, value, ts FROM readings WHERE sensor_id = %s"
    params = [sensor_id]

    if depuis:
        sql += " AND ts >= %s"
        params.append(depuis)

    sql += " ORDER BY ts ASC LIMIT %s OFFSET %s;"
    params.extend([limit, offset])

    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM sensors WHERE id = %s;", (sensor_id,))
        if cur.fetchone() is None:
            raise HTTPException(status_code=404, detail=f"capteur '{sensor_id}' inconnu")
        cur.execute(sql, params)
        return [{"sensor_id": r[0], "value": r[1], "ts": r[2]} for r in cur.fetchall()]


@app.get("/readings/hourly")
def get_hourly(sensor_id: str, limit: int = 100):
    limit = min(limit, 1000)
    with conn.cursor() as cur:
        cur.execute("""
            SELECT sensor_id, heure, moyenne
            FROM readings_hourly
            WHERE sensor_id = %s
            ORDER BY heure DESC
            LIMIT %s;
        """, (sensor_id, limit))
        return [{"sensor_id": r[0], "heure": r[1], "moyenne": r[2]} for r in cur.fetchall()]