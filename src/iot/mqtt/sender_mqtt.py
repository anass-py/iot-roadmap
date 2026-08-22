import random, time, json
from datetime import datetime, timezone
import paho.mqtt.client as mqtt
from paho.mqtt.enums import CallbackAPIVersion
from iot.config import MQTT_BROKER, MQTT_PORT
from iot.config import MQTT_USER, MQTT_PASSWORD

DEVICE_ID = "sim-001"
SENSOR_TYPE = "temperature"
TOPIC = f"voligle/telemetry/{DEVICE_ID}/{SENSOR_TYPE}"

def on_connect(client, userdata, flags, reason_code, properties):
    print("connecté" if reason_code == 0 else f"échec: {reason_code}")

client = mqtt.Client(CallbackAPIVersion.VERSION2, DEVICE_ID)
client.on_connect = on_connect
client.username_pw_set(MQTT_USER, MQTT_PASSWORD)
print("auth:", MQTT_USER, MQTT_PASSWORD)
client.connect(MQTT_BROKER, MQTT_PORT)
client.loop_start()

try:
    while True:
        payload = json.dumps({
            "device_id": DEVICE_ID,
            "sensor_type": SENSOR_TYPE,
            "value": round(random.uniform(18, 25), 2),
            "unit": "C",
            "ts": datetime.now(timezone.utc).isoformat(),
        })
        client.publish(TOPIC, payload, qos=1)
        print("envoyé:", payload)
        time.sleep(2)
except KeyboardInterrupt:
    client.loop_stop()
    client.disconnect()