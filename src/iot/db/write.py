import psycopg
from iot.config import DATABASE_URL

with psycopg.connect(DATABASE_URL) as conn:
    with conn.cursor() as cur:
        cur.execute("INSERT INTO devices (id, model, location) VALUES (%s,%s,%s);",
                    ("raspberry_001", "Raspberry Pi 4", "salon"))
        cur.execute("INSERT INTO devices (id, model, location) VALUES (%s,%s,%s);",
                    ("raspberry_002", "Raspberry Pi 5", "cuisine"))

        cur.execute("INSERT INTO sensors (id, device_id, type, unit) VALUES (%s,%s,%s,%s);",
                    ("temp_01", "raspberry_001", "temperature", "C"))
        cur.execute("INSERT INTO sensors (id, device_id, type, unit) VALUES (%s,%s,%s,%s);",
                    ("hum_01", "raspberry_002", "humidity", "%"))
        cur.execute("INSERT INTO sensors (id, device_id, type, unit) VALUES (%s,%s,%s,%s);",
                    ("temp_02", "raspberry_002", "temperature", "C"))  # sans mesure, exprès

        for v in (21.4, 22.1, 20.8):
            cur.execute("INSERT INTO readings (sensor_id, value, ts) VALUES (%s,%s,now());",
                        ("temp_01", v))
        for v in (55.2, 56.1, 54.8):
            cur.execute("INSERT INTO readings (sensor_id, value, ts) VALUES (%s,%s,now());",
                ("hum_01", v))
        print("données insérées")
