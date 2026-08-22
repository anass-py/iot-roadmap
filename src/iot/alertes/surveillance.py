from dotenv import load_dotenv
load_dotenv()

import time
import psycopg
from iot.alertes.alertes import envoyer_alerte

CONN = "postgresql://postgres:devpass@localhost:5432/postgres"

deja_signales = set()   # capteurs déjà en alerte

def verifier_silence():
    with psycopg.connect(CONN) as conn:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT s.id
                FROM sensors s
                LEFT JOIN readings r ON r.sensor_id = s.id
                GROUP BY s.id
                HAVING now() - MAX(r.ts) > INTERVAL '30 seconds'
                    OR MAX(r.ts) IS NULL;
            """)
            silencieux = {row[0] for row in cur.fetchall()}

    # nouveaux silencieux → on alerte
    for sensor_id in silencieux - deja_signales:
        envoyer_alerte(f"⚠️ Capteur '{sensor_id}' silencieux")
        print("ALERTE:", sensor_id)

    # revenus à la vie → on notifie le retour
    for sensor_id in deja_signales - silencieux:
        envoyer_alerte(f"✅ Capteur '{sensor_id}' de nouveau actif")
        print("RÉTABLI:", sensor_id)

    deja_signales.clear()
    deja_signales.update(silencieux)

if __name__ == "__main__":
    while True:
        verifier_silence()
        time.sleep(30)