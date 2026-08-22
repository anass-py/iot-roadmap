"""Configuration centrale du projet.

Toutes les valeurs sont lues depuis le fichier .env à la racine, avec une
valeur par défaut pour le dev local. Un seul endroit à changer au lieu de
cinq fichiers.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

# src/iot/config.py -> src/iot -> src -> racine du projet
ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")

# ---------- Base de données ----------
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:devpass@localhost:5432/postgres"
)

# ---------- MQTT ----------
# Broker local (conteneur mosquitto) : sender_mqtt / receiver_mqtt
MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))

# Broker public : sender_multiple / receiver_multiple
MQTT_PUBLIC_BROKER = os.getenv("MQTT_PUBLIC_BROKER", "broker.emqx.io")
MQTT_PUBLIC_PORT = int(os.getenv("MQTT_PUBLIC_PORT", "1883"))

# Topics
TOPIC_TELEMETRY = "voligle/telemetry/#"
TOPIC_ALL = "voligle/#"

# ---------- API ----------
API_KEY = os.getenv("API_KEY", "ma-cle-secrete")

# ---------- Alertes Telegram ----------
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

#---------- AUTH MQTT ---------------
MQTT_USER = os.getenv("MQTT_USER")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD")