import paho.mqtt.client as mqtt
from paho.mqtt.enums import CallbackAPIVersion
import json
import psycopg
from iot.config import DATABASE_URL, MQTT_BROKER, MQTT_PORT, TOPIC_TELEMETRY
from paho.mqtt.properties import Properties
from paho.mqtt.packettypes import PacketTypes
from iot.config import MQTT_USER, MQTT_PASSWORD
from iot.core.validation import payload_valide

conn = psycopg.connect(DATABASE_URL, autocommit=True)

def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        print("connecté")
        client.subscribe(TOPIC_TELEMETRY, qos=1)   # tous les capteurs
    else:
        print(f"échec: {reason_code}")


def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
    except json.JSONDecodeError:
        print("payload illisible:", msg.payload)
        return

    # sensor_id extrait du topic : voligle/telemetry/<device>/<sensor>
    parties = msg.topic.split("/")
    sensor_id = parties[-1]
    device_id = parties[-2]
    value = data.get("value")
    measured_at = data.get("ts")

    if not payload_valide(data):
        print("pas de value, ignoré:", data)
        return

    with conn.cursor() as cur:
        # créer l'appareil et le capteur à la volée si inconnus
        cur.execute("INSERT INTO devices (id) VALUES (%s) ON CONFLICT DO NOTHING;",
                    (device_id,))
        cur.execute("""INSERT INTO sensors (id, device_id, type, unit)
                       VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING;""",
                    (sensor_id, device_id, data.get("sensor_type", "unknown"),
                     data.get("unit", "")))
        # insérer la mesure
        cur.execute("INSERT INTO readings (sensor_id, value, ts, received_at) VALUES (%s, %s, %s, now());",
                    (sensor_id, value, measured_at))

    print(f"stocké: {sensor_id} = {value}")

if __name__ == "__main__":
    props = Properties(PacketTypes.CONNECT)
    props.SessionExpiryInterval = 3600  # garde la session 1 heure

    client = mqtt.Client(CallbackAPIVersion.VERSION2, "db_receiver", protocol=mqtt.MQTTv5)
    client.on_connect = on_connect
    client.on_message = on_message
    client.username_pw_set(MQTT_USER, MQTT_PASSWORD)
    client.connect(MQTT_BROKER, MQTT_PORT, clean_start=False, properties=props)

    print("écoute... Ctrl+C pour arrêter.")
    try:
        client.loop_forever()
    except KeyboardInterrupt:
        conn.close()
        client.disconnect()