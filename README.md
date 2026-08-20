# IOT — pipeline capteurs → TimescaleDB → API → alertes

Capteurs simulés qui publient en MQTT, un receiver qui stocke dans TimescaleDB,
une API FastAPI qui expose les mesures, et des alertes Telegram.

## Structure

```
IOT/
├── .venv/                  # LE seul environnement virtuel du projet
├── .env                    # secrets réels (jamais committé)
├── .env.example            # modèle à copier
├── docker-compose.yml      # timescaledb + mosquitto + grafana
├── pyproject.toml          # rend `iot` importable partout
├── requirements.txt        # versions figées
├── Notes.md                # notes de cours
├── frictions.ms            # idées / frictions
├── docs/                   # documents (non versionnés pour cv/docx)
└── src/iot/
    ├── config.py           # ⭐ TOUTE la config : DB, MQTT, clés
    ├── api/main.py         # API FastAPI + receiver MQTT en thread
    ├── db/
    │   ├── schema.py       # crée tables + hypertable + vue continue
    │   ├── write.py        # insère des données de test
    │   ├── read.py         # exemples JOIN / GROUP BY / LAG
    │   └── bench.py        # execute vs executemany
    ├── mqtt/
    │   ├── sender_mqtt.py       # 1 capteur → broker local
    │   ├── receiver_mqtt.py     # broker local → TimescaleDB
    │   ├── sender_multiple.py   # temp+humidité+état → broker public
    │   └── receiver_multiple.py # broker public → mémoire + API
    └── alerts/alerts.py    # notification Telegram
```

## Installation

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -e .              # rend `import iot` possible depuis n'importe où
cp .env.example .env          # puis remplis tes tokens
```

> `pip install -e .` est ce qui fait marcher `from iot.config import ...`.
> Sans cette ligne, les imports échouent.

## Lancer l'infra

Tes conteneurs tournent déjà à la main. Le `docker-compose.yml` décrit la même
stack. Pour basculer dessus :

```bash
# 1. exporte tes dashboards Grafana (ils ne sont PAS dans un volume aujourd'hui)
# 2. supprime les conteneurs manuels (le volume pgdata, lui, est conservé)
docker rm -f iot-db mosquitto grafana
# 3. relance via compose
docker compose up -d
```

⚠️ `pgdata` est déclaré `external: true` → tes données Postgres survivent.
Les dashboards Grafana, eux, sont dans le conteneur actuel et seront perdus si
tu ne les exportes pas avant.

## Utilisation

```bash
source .venv/bin/activate

python -m iot.db.schema          # (ré)initialise le schéma — DROP puis CREATE
python -m iot.db.write           # données de test
python -m iot.db.read            # requêtes d'exemple
python -m iot.db.bench           # comparaison execute / executemany

python -m iot.mqtt.sender_mqtt   # terminal 1 : publie
python -m iot.mqtt.receiver_mqtt # terminal 2 : stocke en base

uvicorn iot.api.main:app --reload            # API sur :8000
uvicorn iot.mqtt.receiver_multiple:app --reload
```

### Endpoints

| Méthode | Route                       | Auth        |
|---------|-----------------------------|-------------|
| GET     | `/health`                   | —           |
| GET     | `/sensors/latest`           | —           |
| POST    | `/sensors/{sensor_id}/config` | —         |
| GET     | `/readings`                 | `X-API-Key` |
| GET     | `/readings/hourly`          | —           |

```bash
curl -H "X-API-Key: $API_KEY" "http://localhost:8000/readings?sensor_id=temp_01&limit=10"
```

## Règles du projet

- **Un seul venv** : `.venv/` à la racine. Ne pas en créer dans les sous-dossiers.
- **Aucun secret en dur** : tout passe par `.env` → `src/iot/config.py`.
- **`schema.py` fait des `DROP`** : il efface les données avant de recréer.
