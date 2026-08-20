import random
import time
import json
import paho.mqtt.client as mqtt
from paho.mqtt.enums import CallbackAPIVersion
from datetime import datetime, timezone

# ─── CONFIG ──────────────────────────────────────────────
from iot.config import MQTT_PUBLIC_BROKER as BROKER, MQTT_PUBLIC_PORT as PORT
CLIENT_ID  = "sensor_node_01"
DEVICE_ID  = "node_01"

TOPIC_TEMP     = "voligle/telemetry/temperature"
TOPIC_HUMIDITY = "voligle/telemetry/humidity"
TOPIC_STATE    = "voligle/system/state"

# ─── CALLBACKS ───────────────────────────────────────────
def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        print(f"[{CLIENT_ID}] Connected to broker.")
    else:
        print(f"[{CLIENT_ID}] Connection failed: {reason_code}")

def on_disconnect(client, userdata, flags, reason_code, properties):
    # Fires when the connection drops — paho handles reconnect automatically
    print(f"[{CLIENT_ID}] Disconnected (code: {reason_code}). Reconnecting...")

def on_publish(client, userdata, mid, reason_code, properties):
    # QoS 1 confirmation — broker acknowledged the message
    print(f"[ACK] Message {mid} confirmed by broker.")

# ─── SETUP ───────────────────────────────────────────────
client = mqtt.Client(CallbackAPIVersion.VERSION2, CLIENT_ID)

# Last Will and Testament — if the sender crashes or disconnects unexpectedly,
# the broker automatically publishes this message on its behalf.
# Receivers can detect that the device went offline.
client.will_set(
    topic=f"voligle/system/{DEVICE_ID}/status",
    payload=json.dumps({"status": "OFFLINE", "device": DEVICE_ID}),
    qos=1,
    retain=True  # Retained = last known state stays visible to new subscribers
)

client.on_connect    = on_connect
client.on_disconnect = on_disconnect
client.on_publish    = on_publish

client.connect(BROKER, PORT)
client.loop_start()

# ─── MAIN LOOP ───────────────────────────────────────────
print("Transmitting sensor data... Press Ctrl+C to stop.")

def now():
    return datetime.now(timezone.utc).isoformat()

try:
    while True:
        temp_payload = json.dumps({
            "device_id" : DEVICE_ID,
            "value"     : round(random.uniform(20.0, 45.0), 2),
            "unit"      : "celsius",
            "timestamp" : now()
        })

        hum_payload = json.dumps({
            "device_id" : DEVICE_ID,
            "value"     : random.randint(30, 80),
            "unit"      : "%",
            "timestamp" : now()
        })

        state_payload = json.dumps({
            "device_id" : DEVICE_ID,
            "status"    : random.choice(["OK", "WARN", "ERR", "MAINTENANCE"]),
            "timestamp" : now()
        })

        client.publish(TOPIC_TEMP,     temp_payload,  qos=1)
        client.publish(TOPIC_HUMIDITY, hum_payload,   qos=1)
        client.publish(TOPIC_STATE,    state_payload, qos=1)

        print(f"[{TOPIC_TEMP}]     → {temp_payload}")
        print(f"[{TOPIC_HUMIDITY}] → {hum_payload}")
        print(f"[{TOPIC_STATE}]    → {state_payload}")
        print("-" * 50)

        time.sleep(2)

except KeyboardInterrupt:
    print("\nShutting down sender...")
    client.loop_stop()
    client.disconnect()
    print("Disconnected safely.")