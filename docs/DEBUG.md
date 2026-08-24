# Problèmes rencontrés — et comment je les ai résolus

Les vrais bugs du projet. Utile en entretien : « racontez un problème que vous avez débogué ».

---

## MQTT

**Rien n'arrive côté receiver, aucune erreur.**
Le sender publiait sur un topic qui ne correspondait pas au filtre d'abonnement.
→ Isoler avec `mosquitto_sub -t "#" -v` : si ça défile, le sender va bien, c'est le filtre. Sinon, c'est le sender.

**Le payload arrive mais `device_id` vaut "inconnu".**
Contrat de message rompu : le sender n'envoyait pas la clé attendue. Aucune erreur, le broker transporte des octets sans rien valider.
→ Corriger le **sender** (pas le receiver), pour que le contrat devienne la référence du projet.

**Le dict partagé reste vide alors que les prints s'affichent.**
Deux causes possibles : réassignation d'une variable locale au lieu de muter le dict global, ou deux processus séparés (deux mémoires distinctes).
→ Un dict en mémoire ne se partage ni entre processus ni après redémarrage → passer en base.

**`clean_start=False` → `ValueError: Clean start only applies to MQTT V5`.**
Le paramètre n'existe qu'en MQTT v5.
→ `protocol=mqtt.MQTTv5` + `Properties(PacketTypes.CONNECT)` avec `SessionExpiryInterval`.

**Le broker accepte encore les connexions après avoir activé l'auth.**
Un ancien conteneur Mosquitto (lancé par `docker run`) tournait encore sur le port 1883.
→ `docker ps | grep 1883` pour vérifier qu'il n'y a qu'un seul broker.

**`Unable to open config file '/mosquitto/config/mosquitto.conf'`.**
Le fichier s'appelait `mosquitto.config` au lieu de `mosquitto.conf`.
→ Lire le chemin **exact** réclamé dans le message d'erreur et le comparer à ce qu'on a.

---

## Base de données

**`column "sensor_id" does not exist` à la création d'un index.**
`CREATE TABLE IF NOT EXISTS` vérifie le **nom**, pas la structure. L'ancienne table avec l'ancien schéma était encore là.
→ `DROP TABLE` avant, dans l'ordre inverse des dépendances (readings → sensors → devices).

**`the cursor is closed` au `fetchall()`.**
Le `fetchall()` était hors du bloc `with conn.cursor()`. Le curseur se ferme à la sortie du `with`.
→ Tout ce qui touche à `cur` reste dans le `with`.

**`extension "timescaledb" must be preloaded`.**
Le volume contenait la config d'une ancienne base Postgres sans préchargement Timescale.
→ Le volume garde les données **et** la config. Changer d'image ne suffit pas si la config n'a pas la ligne `shared_preload_libraries`.

**`could not access file "timescaledb": No such file or directory` — Postgres refuse de démarrer.**
La config demandait de précharger Timescale, mais l'image `postgres:16` ne contient pas la bibliothèque.
→ Il faut **les deux** : la config (volume) ET l'image qui contient le moteur.

**`cannot create a unique index without the column "ts"`.**
Timescale exige que la colonne de découpage fasse partie de la clé primaire.
→ `PRIMARY KEY (id, ts)`. Sur une table existante : `ALTER TABLE ... DROP CONSTRAINT` puis `ADD PRIMARY KEY`, sans vider la table.

**`CREATE MATERIALIZED VIEW ... cannot run inside a transaction block`.**
Le `with psycopg.connect()` ouvre une transaction ; l'agrégat continu refuse d'y être.
→ `psycopg.connect(..., autocommit=True)`.

**Le schéma marchait au terminal mais pas en relançant `schema.py`.**
Des commandes tapées à la main (hypertable, agrégat, rétention, colonne `received_at`) n'avaient jamais été ajoutées au fichier.
→ La structure de la base doit vivre **dans le code**, pas dans l'historique du terminal.

---

## Grafana

**Une seule ligne verticale au lieu d'une courbe.**
Toutes les mesures avaient le même timestamp (`seed.py` insérait tout avec `now()`).
→ Vérifier avec `GROUP BY sensor_id` + `MIN(ts)`, `MAX(ts)` : si min = max, les données ne sont pas étalées dans le temps.

**404 « File not found » sur une URL de l'API.**
Format d'erreur d'un autre serveur — FastAPI aurait renvoyé du JSON. Uvicorn ne tournait pas, ou un autre programme occupait le port.
→ Lire la **forme** du message d'erreur pour savoir qui répond.

---

## Docker

**`pip install` échoue au build.**
Le `requirements.txt` généré par `pip freeze` contenait `-e /Users/voligle/workspace/IOT` — un chemin absolu local, inexistant dans l'image.
→ Retirer l'install editable du requirements destiné à Docker ; `ENV PYTHONPATH=/app/src` fait le même travail.

**Docker Desktop complètement figé, `docker ps` ne répond plus.**
→ `sudo pkill -9 -f Docker`, ou redémarrer le Mac. Le volume survit, aucune donnée perdue.

**Aucun log Python dans le conteneur, alors que le service fonctionne (alertes Telegram reçues).**
Python bufferise sa sortie quand elle n'est pas connectée à un terminal : les `print()` s'accumulent au lieu de s'afficher.
→ `ENV PYTHONUNBUFFERED=1` dans le Dockerfile. Réflexe standard pour tout Python conteneurisé.

**Base vide après le passage à Docker Compose.**
Compose crée ses propres volumes préfixés par le nom du projet (`iot_pgdata` ≠ `pgdata`).
→ Soit repartir propre, soit déclarer le volume `external: true` pour réutiliser l'existant.

**`ModuleNotFoundError: No module named 'alertes'` dans le conteneur, alors que ça marchait en local.**
`from alertes import ...` fonctionnait en local parce que le fichier était lancé **depuis son dossier**. Dans le conteneur, on lance depuis `/app` avec `PYTHONPATH=/app/src` → l'import simple casse.
→ Import absolu depuis la racine du paquet : `from iot.alertes.alertes import envoyer_alerte`.
→ **Leçon** : conteneuriser révèle les dépendances implicites au dossier de lancement. Le code avait déjà cette fragilité, Docker l'a exposée.

---

## Déploiement AWS

**`Connection refused` du receiver vers la base, au premier démarrage.**
`depends_on` garantit l'**ordre de démarrage**, pas la **disponibilité**. Timescale met 10–30 s à s'initialiser (il se configure, redémarre, puis accepte les connexions).
→ Vraies solutions : `healthcheck` + `depends_on: condition: service_healthy`, ou reconnexion dans le code. `restart: unless-stopped` est le rattrapage brutal.
→ Attention : `logs --tail 5` peut montrer des erreurs **anciennes**. Vérifier le STATUS dans `docker compose ps` et utiliser `--timestamps`.

**`Your local changes would be overwritten by merge` au `git pull`.**
Le fichier avait été édité **sur le serveur** avec nano, et aussi sur le Mac.
→ `git checkout -- <fichier>` puis `git pull`.
→ **Règle** : le serveur ne fait que `git pull` + `docker compose up`. On n'édite jamais le code sur le serveur. Seule exception : le `.env`, qui n'est jamais dans git.

**`git ls-files` révèle `mosquitto/config/passwd` — un fichier de secrets suivi par git.**
Le fichier de mots de passe (même hachés) était versionné, donc sur GitHub.
→ `.gitignore` + `git rm --cached mosquitto/config/passwd` (garde le fichier sur disque, arrête de le suivre). Reste dans l'historique — acceptable ici (hachés), sinon `git filter-repo`.
→ **Leçon** : `passwd` est un secret au même titre que `.env` — jamais dans git, recréé dans chaque environnement avec `mosquitto_passwd`.

**Après un stop/start d'instance EC2, impossible de se connecter en SSH.**
L'IP publique EC2 est **éphémère** : elle change à chaque arrêt/redémarrage.
→ Récupérer la nouvelle IP dans la console. Pour une adresse stable : **Elastic IP** (fixe, gratuite tant qu'attachée à une instance active — une Elastic IP non attachée est facturée).

**Après redémarrage de l'instance EC2, aucun conteneur ne remonte malgré `restart: unless-stopped`.**
`unless-stopped` = redémarre SAUF si arrêté explicitement. Les conteneurs stoppés à la main (ou à l'arrêt de l'instance) ne reviennent pas.
→ `docker compose up -d` pour relancer. Pour un retour **automatique** après reboot : `restart: always`, ou un service systemd qui lance `docker compose up` au démarrage.

**Un service (mosquitto) absent de `docker compose ps` alors qu'il est bien dans le `docker-compose.yml`.**
Compose tournait sur une **définition en cache**, pas sur le fichier à jour (après plusieurs redémarrages/modifications).
→ `docker compose down && docker compose up -d` force la relecture complète du fichier. Plus fiable qu'un simple `up` après des changements.

**Mosquitto : `Unable to open pwfile` alors que le fichier `passwd` existe.**
Le fichier appartenait à `root` avec permissions `-rw-------`, mais Mosquitto tourne en tant qu'utilisateur `mosquitto` dans le conteneur → pas le droit de le lire.
→ `sudo chmod 644 mosquitto/config/passwd` (lisible par tous ; sans risque car mots de passe hachés).
→ **Leçon** : un fichier créé par un conteneur root peut être illisible par le process qui en a besoin. Vérifier propriétaire ET permissions, pas seulement l'existence.

---

## Réflexes de débogage à retenir

1. **Isoler** avant de corriger : quel maillon casse ? (`mosquitto_sub` pour MQTT, `docker compose ps` pour les services)
2. **Lire le message exact** : chemin, nom de fichier, port. L'erreur dit souvent précisément ce qui manque.
3. **Vérifier l'état réel** plutôt que supposer (`docker ps`, `timescaledb_information.jobs`, `MIN/MAX(ts)`).
4. **Attention aux logs anciens** : un service peut être `Up` avec des erreurs datées du démarrage.
5. **Un conteneur ne connaît que son propre monde** : chemins absolus locaux, `localhost`, ports non exposés — autant de pièges.
