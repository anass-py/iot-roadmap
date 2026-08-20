import psycopg
import time

from iot.config import DATABASE_URL

with psycopg.connect(DATABASE_URL) as conn:
    with conn.cursor() as cur:

        # on s'assure que le capteur existe (clé étrangère)
        cur.execute("INSERT INTO devices (id) VALUES ('bench_dev') ON CONFLICT DO NOTHING;")
        cur.execute("""INSERT INTO sensors (id, device_id, type, unit)
                       VALUES ('bench_01', 'bench_dev', 'temperature', 'C')
                       ON CONFLICT DO NOTHING;""")
        conn.commit()

        N = 10000
        donnees = [("bench_01", 20.0 + i * 0.001) for i in range(N)]

        # ---------- 1. LIGNE PAR LIGNE ----------
        t0 = time.perf_counter()
        for sensor_id, value in donnees:
            cur.execute(
                "INSERT INTO readings (sensor_id, value, ts) VALUES (%s, %s, now());",
                (sensor_id, value),
            )
        conn.commit()
        t_lignes = time.perf_counter() - t0

        # ---------- 2. PAR PAQUET ----------
        t0 = time.perf_counter()
        cur.executemany(
            "INSERT INTO readings (sensor_id, value, ts) VALUES (%s, %s, now());",
            donnees,
        )
        conn.commit()
        t_batch = time.perf_counter() - t0

        print(f"ligne par ligne : {t_lignes:.3f} s")
        print(f"par paquet      : {t_batch:.3f} s")
        print(f"gain            : {t_lignes / t_batch:.1f}x plus rapide")