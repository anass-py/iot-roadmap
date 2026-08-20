import psycopg

from iot.config import DATABASE_URL

with psycopg.connect(DATABASE_URL) as conn:
    with conn.cursor() as cur:
        cur.execute("""
                    SELECT s.id, r.value
                    FROM readings r
                    JOIN sensors s ON r.sensor_id = s.id
                    
                    
                    """)

        cur.execute("""
                    SELECT s.id, r.value
                    FROM sensors s
                    LEFT JOIN readings r ON s.id = r.sensor_id
                    """)
      
        for ligne in cur.fetchall():
            print(ligne)
        print("-------------------")
        ## regroupe par sensor_id 
        cur.execute("""
                    SELECT sensor_id, AVG(value), MAX(value), COUNT(*)
                    FROM readings r
                    GROUP BY sensor_id
                    """)
        ## regroupe par heure
        cur.execute ("""
                    SELECT 
                        sensor_id,
                        date_trunc('hour', ts) as HEURE,
                        AVG(value)
                    FROM readings 
                    GROUP BY sensor_id, date_trunc('hour', ts)
                    ORDER BY heure
                    """)
        for ligne in cur.fetchall():
            print(ligne)

        ## fenetre == delta 

        cur.execute("""
                    SELECT
                        sensor_id,
                        ts,
                        value,
                        value - LAG(value) OVER (PARTITION BY sensor_id ORDER BY ts) AS delta 
                    FROM readings 
                    
                    
                    """)
        print("----------")
        for ligne in cur.fetchall():
            print(ligne)
        print("----hypertable----")
       # cur.execute("SELECT hypertable_name, num_chunks FROM timescaledb_information.hypertables;")
        #print(cur.fetchall())
        # dans query.py
        cur.execute("SELECT COUNT(*) FROM readings;")
        print(cur.fetchall())