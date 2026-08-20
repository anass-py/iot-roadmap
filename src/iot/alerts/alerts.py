import requests

from iot.config import TELEGRAM_CHAT_ID, TELEGRAM_TOKEN


def envoyer_alerte(message):
    url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
    requests.post(url, json={"chat_id": TELEGRAM_CHAT_ID, "text": message})
