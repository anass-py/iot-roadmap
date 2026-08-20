import json
import threading
import paho.mqtt.client as mqtt
from paho.mqtt.enums import CallbackAPIVersion
from fastapi import FastAPI

# ─── CONFIG ──────────────────────────────────────────────
from iot.config import MQTT_PUBLIC_BROKER as BROKER, MQTT_PUBLIC_PORT as PORT, TOPIC_ALL
CLIENT_ID = "backend_receiver_01"

# ─── SHARED DATA STORE ───────────────────────────────────
sensor_data = {
    "temperature" : [],
    "humidity"    : [],
    "state"       : []
}

# ─── FASTAPI ─────────────────────────────────────────────
app = FastAPI()

@app.get("/sensors")
def get_all_sensors():
    # Returns all readings for all sensor types
    return sensor_data

@app.get("/sensors/{sensor_type}")
def get_sensor(sensor_type: str):
    # Returns all readings for one sensor type
    if sensor_type not in sensor_data:
        return {"error": f"Unknown sensor type: {sensor_type}"}
    return sensor_data[sensor_type]

@app.get("/sensors/{sensor_type}/latest")
def get_latest(sensor_type: str):
    # Returns only the most recent reading
    if sensor_type not in sensor_data:
        return {"error": f"Unknown sensor type: {sensor_type}"}
    if not sensor_data[sensor_type]:
        return {"error": "No data yet"}
    return sensor_data[sensor_type][-1]

# ─── MQTT CALLBACKS ──────────────────────────────────────
def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        print(f"[{CLIENT_ID}] Connected to broker.")
        client.subscribe(TOPIC_ALL, qos=1)
        print("Subscribed to voligle/# — waiting for data...\n")
    else:
        print(f"[{CLIENT_ID}] Connection failed: {reason_code}")

def on_disconnect(client, userdata, flags, reason_code, properties):
    print(f"[{CLIENT_ID}] Disconnected (code: {reason_code}). Reconnecting...")

def on_message(client, userdata, msg):
    topic = msg.topic
    raw   = msg.payload.decode()

    try:
        data = json.loads(raw)

        device    = data.get("device_id", "unknown")
        timestamp = data.get("timestamp", "no timestamp")

        if "temperature" in topic:
            sensor_data["temperature"].append(data)
            value = data.get("value", "N/A")
            unit  = data.get("unit", "")
            print(f"🌡️  [TEMP]     {device} | {value} {unit} | {timestamp}")

        elif "humidity" in topic:
            sensor_data["humidity"].append(data)
            value = data.get("value", "N/A")
            print(f"💧 [HUMIDITY] {device} | {value}% | {timestamp}")

        elif "state" in topic:
            sensor_data["state"].append(data)
            status = data.get("status", "N/A")
            print(f"⚙️  [SYSTEM]   {device} | status={status} | {timestamp}")

        elif "status" in topic:
            status = data.get("status", "N/A")
            print(f"🔴 [LWT]      {device} went {status}")

        else:
            print(f"[{topic}] Unknown format: {data}")

    except json.JSONDecodeError:
        print(f"⚠️  [{topic}] Non-JSON payload: {raw}")

# ─── MQTT SETUP ──────────────────────────────────────────
client = mqtt.Client(CallbackAPIVersion.VERSION2, CLIENT_ID)

client.on_connect    = on_connect
client.on_disconnect = on_disconnect
client.on_message    = on_message

client.connect(BROKER, PORT, clean_start=False)

# Run MQTT in background thread — FastAPI takes the main thread
mqtt_thread = threading.Thread(target=client.loop_forever)
mqtt_thread.daemon = True  # Thread dies when main process exits
mqtt_thread.start()

print("Backend listener + API starting...")