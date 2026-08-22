FROM python:3.14-slim

WORKDIR /app

# 1. dépendances d'abord (pour le cache)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 2. le code ensuite
COPY src/ ./src/

# 3. pour que Python trouve le paquet iot
ENV PYTHONPATH=/app/src

# 4. commande de démarrage
CMD ["python", "src/iot/mqtt/receiver_mqtt.py"]