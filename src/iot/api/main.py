import json
import threading
from datetime import datetime
from typing import Optional

import psycopg
import paho.mqtt.client as mqtt
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel

from iot.config import API_KEY, DATABASE_URL
from iot.config import MQTT_BROKER as BROKER
from iot.config import MQTT_PORT as PORT
from iot.config import TOPIC_TELEMETRY as TOPIC


class SensorConfig(BaseModel):
    interval_seconds: int
    enabled: bool
    threshold: float
app = FastAPI()
#---------SECURE API-----------


def verifier_cle(x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="clé d'API invalide")
    

derniere_lecture = {}   # le store partagé
#-------------DB------------
conn = psycopg.connect(DATABASE_URL, autocommit=True)
# ---------- MQTT ----------

def on_connect(client, userdata, flags, rc, properties=None):
    print("connecté au broker:", rc)
    client.subscribe(TOPIC, qos=1)   # DANS on_connect

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
    except json.JSONDecodeError:
        print("payload illisible:", msg.payload)
        return

    device_id = payload.get("device_id", "inconnu")
    derniere_lecture[device_id] = payload
    print("reçu:", device_id, payload.get("value"))

def demarrer_mqtt():
    client = mqtt.Client(
        mqtt.CallbackAPIVersion.VERSION2,
        client_id="api-receiver"
    )
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(BROKER, PORT)
    client.loop_forever()

threading.Thread(target=demarrer_mqtt, daemon=True).start()

# ---------- API ----------

@app.get("/health")
def health():
    return {"status": "ok", "devices": len(derniere_lecture)}

@app.get("/sensors/latest")
def latest():
    return derniere_lecture

@app.post("/sensors/{sensor_id}/config")
def set_config(sensor_id: str, config: SensorConfig):
    return {"sensor_id": sensor_id, "config_recue": config}

#-------------_______________------------#

@app.get("/readings", dependencies=[Depends(verifier_cle)])
def get_readings(
    sensor_id: str, 
    depuis: Optional[datetime] = None,
    limit: int = 100,
    offset : int = 0,
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
        # le capteur existe-t-il ?
        cur.execute("SELECT 1 FROM sensors WHERE id = %s;", (sensor_id,))
        if cur.fetchone() is None:
            raise HTTPException(status_code=404,
                                detail=f"capteur '{sensor_id}' inconnu")
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
            resultat = []
            for r in cur.fetchall():
                resultat.append({"sensor_id": r[0], "heure": r[1], "moyenne": r[2]})
            return resultat