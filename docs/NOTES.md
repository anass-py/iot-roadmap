# Notes entretien — projet télémétrie IoT

Fiche courte. Une notion = une ou deux lignes. Pour réviser, pas pour apprendre.

---

## Architecture du projet

```
sender ──▶ broker MQTT ──▶ receiver (ingestion) ──▶ TimescaleDB ──▶ API ──▶ Grafana
                                                          └──▶ surveillance ──▶ Telegram
```

- **Un seul écrivain** : le receiver écrit en base. L'API et la surveillance ne font que lire.
- 4 services séparés, 1 responsabilité chacun. On peut redémarrer l'un sans les autres.
- Le topic porte l'identité (`voligle/telemetry/<device>/<sensor>`), le payload porte la valeur.

---

## MQTT

- **QoS 0** : envoie et oublie, peut perdre. **QoS 1** : au moins une fois, doublons possibles. **QoS 2** : exactement une fois, handshake 4 temps.
- **LWT** : message que le broker envoie *pour* l'appareil quand il tombe (l'appareil mort ne peut pas s'annoncer lui-même).
- **Retained** : le broker garde le dernier message ; un nouvel abonné le reçoit tout de suite.
- **Wildcards** : `+` = un niveau, `#` = tous les niveaux restants (en dernier).
- **Session persistante** : le broker garde les messages d'un abonné absent SI `clean_start=False` + `client_id` fixe + QoS ≥ 1. Sinon les messages sont perdus.
- **client_id** : identité d'un client, unique à un instant donné, stable dans le temps.
- **Contrat de message** : le broker ne valide rien, il transporte des octets. Producteur et consommateur doivent s'accorder sur la forme → on valide à l'ingestion.

## Protocoles (la question qui tranche : sur pile ou secteur ? combien de données ?)

- **LoRaWAN** : très longue portée, très basse conso, débit minuscule. Capteurs dispersés.
- **NB-IoT** : cellulaire opérateur, pas d'infra à déployer, une SIM. Abonnement par appareil.
- **BLE** : courte portée, basse conso. Communication avec un téléphone/passerelle proche.
- **Zigbee** : basse conso, maillé (chaque appareil relaie). Domotique.
- **Wi-Fi** : gros débit, forte conso. Sur secteur, gros volume (caméras).

---

## Docker

- **Image vs conteneur** : image = la classe (le .dmg), conteneur = l'objet (l'app qui tourne). Une image, plusieurs conteneurs.
- **Port `-p HOTE:CONTENEUR`** : gauche = ma machine, droite = l'intérieur. Sans mapping, le conteneur est isolé du réseau de l'hôte.
- **Volume** : le conteneur est éphémère ; tout état qui doit survivre passe par un volume (monté sur le répertoire de données, ex. PGDATA — contient tables ET config).
- **Bind mount vs volume nommé** : bind mount (`./config:/config`) = on **fournit** des fichiers au conteneur (config, mots de passe). Volume nommé (`pgdata:/var/lib/...`) = le conteneur **écrit** ses données, géré par Docker.
- **Services sans état** (API, ingestion, surveillance) = pas de volume, jetables. Seule la base porte l'état.
- **Les fichiers permanents vivent sur l'HÔTE**, pas dans les conteneurs. On les crée sur l'hôte (`touch`, `nano`, `mkdir`) ; les conteneurs les lisent via les volumes. Un fichier créé DANS un conteneur disparaît à sa recréation (sauf sur un volume).
- **Fichier au contenu spécial** (ex. mot de passe haché) : on emprunte l'outil depuis une image (`docker run ... mosquitto_passwd`) pour générer le bon format, mais le fichier atterrit sur l'hôte.
- **Un fichier créé par un conteneur appartient à `root`** sur l'hôte (le conteneur tourne en root par défaut) → souvent illisible par le process qui en a besoin. Vérifier propriétaire + permissions.
- **Réseau** : code sur ma machine → `localhost:port` (si port exposé). Code dans un conteneur → nom du service (Compose crée le réseau tout seul ; `docker run` isolé = non).

## Docker Compose

- Décrit toute la stack dans un fichier, lancée par `docker compose up -d`.
- Réponse à « comment quelqu'un lance ton projet ? ».
- Compose isole ses ressources sous un nom de projet (volumes/réseaux préfixés). Pour réutiliser un volume existant : `external: true`.

## Dockerfile / images

- **Dockerfile** = recette pour construire MON image (mon code). **Compose** = menu qui assemble les services (images publiques + la mienne).
- Image légère = `python:slim` + `.dockerignore` (exclure `.venv`, `.git`, `.env`, caches).
- **Cache de couches** : copier `requirements.txt` AVANT le code → si seul le code change, `pip install` est réutilisé depuis le cache.
- **Multi-étapes** : builder lourd (outils de compilation) → copie du résultat → image finale légère. Sépare construction et exécution. Utile surtout quand il faut compiler. (Pas utilisé ici car `psycopg-binary` est déjà compilé.)
- Une image, plusieurs services : même image, `command:` différent par service.
- Jamais de `-e /chemin/local` dans le requirements destiné à Docker (chemin absolu inexistant dans l'image).

---

## AWS IoT Core (broker managé)

- Broker MQTT **géré par AWS** : rien à installer/maintenir/sécuriser, monte à des millions d'appareils tout seul.
- vs mon Mosquitto : pas de serveur à gérer, sécurité par **certificats X.509** (un par appareil, révocable), pas mot de passe partagé.
- **Rules Engine** : route les messages directement vers d'autres services AWS (base, Lambda, stockage) → remplace le service d'ingestion.
- **Device Shadow** : jumeau cloud de chaque appareil, garde le dernier état connu même hors ligne.
- **Compromis** : Mosquitto = contrôle total, pas de coût récurrent, mais je gère tout. IoT Core = rien à gérer, scalable, mais coût à l'usage + dépendance AWS (lock-in).

## Cross-arch / déploiement flotte

- **Une image Docker est TOUJOURS Linux** (jamais macOS). `python:slim` = Debian minimal + Python. Sur Mac, Docker fait tourner une VM Linux cachée (d'où la conso RAM).
- **ARM vs x86** : un Raspberry est ARM, on développe souvent en x86. Une image x86 ne tourne pas sur ARM (jeux d'instructions différents).
- **Architecture de l'image = celle de la machine de build** par défaut. Mac Apple Silicon → image ARM (tourne sur Pi) ; Mac Intel → image x86 (ne tourne pas sur Pi).
- **`docker buildx`** : construire pour une autre architecture, ou multi-arch (chaque machine prend la bonne). Indispensable pour déployer d'un x86 vers des appareils ARM.
- **balena** (déjà utilisé pro) : déploiement de flotte, **mises à jour delta** = n'envoyer que la différence entre deux images. Crucial sur connexions limitées.

## SQL

- **Ordre d'exécution** : FROM → WHERE → GROUP BY → SELECT → ORDER BY. (Donc WHERE ne connaît pas les alias du SELECT ; ORDER BY oui.)
- **JOIN (= INNER)** : garde seulement les correspondances des deux côtés.
- **LEFT JOIN** : garde tout à gauche, NULL à droite quand il manque.
- **Trouver ce qui manque** : `LEFT JOIN ... WHERE col_droite IS NULL`. (`IS NULL`, jamais `= NULL`.)
- **Mettre à gauche ce qu'on veut garder en entier.**
- **GROUP BY** : transforme les lignes en paquets ; le SELECT ne contient que des colonnes groupées ou des agrégats (AVG, COUNT...).
- **HAVING** : comme WHERE mais après le GROUP BY (filtre sur un agrégat).
- **Fonction fenêtre** : calcul par ligne SANS écraser. `PARTITION BY` = paquets, `LAG` = ligne précédente.
- **Index** `(sensor_id, ts DESC)** : ordre des colonnes = ordre du filtrage (d'abord le capteur, puis le temps). Accélère la lecture, ralentit l'écriture → on indexe selon les requêtes réelles.
- **`%s`, jamais f-string** : le driver envoie requête et valeurs séparément → protège de l'injection SQL.

## Timestamps

- **TIMESTAMPTZ** (avec fuseau), jamais TIMESTAMP. Appareils dans plusieurs pays, serveur UTC.
- **INTERVAL** = une durée (`30 days`, `5 minutes`). `now() - INTERVAL` = « depuis tant de temps ».

## Transactions

- **Transaction** = groupe de commandes tout-ou-rien ; rien d'écrit tant que pas de **commit**.
- **autocommit=True** = chaque commande validée seule. (Nécessaire pour créer un agrégat continu : refuse d'être dans une transaction.)

---

## TimescaleDB

- **Hypertable** : table Postgres découpée automatiquement par le temps en *chunks*. Même SQL, plus rapide sur gros volumes. Transparent pour les clients (Grafana).
- **Clé** : la colonne de temps (`ts`) doit faire partie de la clé primaire → `PRIMARY KEY (id, ts)`.
- **Agrégat continu** = vue matérialisée (résultat stocké) que Timescale rafraîchit toute seule via un job périodique. Pré-calcul → dashboard rapide.
- **≠ temps réel** : job en arrière-plan, pas à chaque insertion. Tendances → agrégat ; alertes → requête directe.
- **Rétention** : `add_retention_policy` supprime les vieux chunks (rapide car par chunk entier). Les moyennes horaires ne sont pas touchées.
- **Migration sans perte** : changer l'image (volume gardé) → `ALTER` pour mettre `ts` dans la clé → `create_hypertable(migrate_data => true)`. Compte identique avant/après.

---

## API (FastAPI)

- Une API est une **façade** : elle expose des questions, pas la base. Protège la base, contrôle le volume renvoyé (`LIMIT`), découple les clients du stockage.
- **Pydantic** (`BaseModel`) : on déclare la forme attendue, FastAPI valide le corps et renvoie **422** si invalide, sans code manuel.
- **Path param** (dans l'URL) vs **query param** (après le `?`) vs **corps** (JSON, typé BaseModel).
- **Pagination** : `LIMIT`/`OFFSET`, avec un plafond imposé par le serveur (`min(limit, 1000)`). (OFFSET lent sur gros volumes → pagination par curseur.)
- **Codes** : 404 ressource inconnue, 422 requête malformée, 401 non authentifié, 500 erreur serveur.
- **Optimisation** : souvent au niveau base (index, pré-agrégation), pas dans le Python.

## CI / GitHub Actions

- **CI (intégration continue)** = vérifications automatiques à chaque push. Filet de sécurité avant que le code atteigne le serveur.
- Fichier `.github/workflows/ci.yml` : GitHub lance une machine Linux jetable, installe le projet, exécute les vérifications.
- `on: [push]` = déclencheur. `runs-on: ubuntu-latest` = machine fournie. `checkout` récupère le code, `setup-python` installe Python.
- Ma CI : `pip install -r requirements.txt` (les dépendances s'installent) + `compileall src/` (pas d'erreur de syntaxe). À enrichir avec pytest.
- Badge vert sur le repo = signal de sérieux visible par un recruteur.

## Sécurité / secrets

- **Jamais de secret en dur.** `os.getenv` + `.env` gitignoré (dev), gestionnaire de secrets (prod).
- `export` = temporaire (terminal). `.env` + `load_dotenv()` = persistant.
- **Config central** : une variable lue à plusieurs endroits ou qui a besoin d'un traitement → un seul point de lecture (`config.py`). Sinon `os.getenv` direct suffit.
- **Clé d'API** : en-tête `X-API-Key`, vérifié via une dépendance FastAPI (`Depends`).
- **Mosquitto** : `allow_anonymous false` + fichier de mots de passe. Auth = qui se connecte ; TLS = chiffrer le transit (utile au déploiement, pas en local).
- **Mot de passe Mosquitto** vit à 2 endroits : en clair dans `.env` (lu par le code), haché dans `passwd` (vérifié par le broker). Les deux hors de git. Changer le mdp = mettre à jour les deux.
- **Fichier `passwd`** : mots de passe hachés, jamais en clair. Mosquitto re-hache ce qu'on envoie et compare (`mosquitto_passwd -c` crée/écrase, sans `-c` = ajoute/modifie).
- **Gestion d'accès** : comptes par appareil/groupe, révocation d'un accès sans couper les autres. **ACL** = restreindre qui publie/lit quels topics (un capteur ne publie que sur son topic, le dashboard ne fait que lire).

---

## Visualisation (Grafana)

- **AS time** : désigne la colonne de l'axe temporel (obligatoire pour Time series, inutile pour Table/Stat).
- **$__timeFilter(ts)** : relie la requête au sélecteur de plage → navigation dans le temps.
- Même requête → Table (valeur exacte) ou Time series (tendance). La visualisation est une couche de présentation.

## Détection & alertes

- **Capteur silencieux** : dernière mesure trop vieille. `now() - MAX(ts) > seuil`. Seuil = quelques fois la période d'émission.
- **Déduplication** : alerter au passage vivant→mort, se taire ensuite. Opérations d'ensembles : `silencieux - deja_signales` = nouvelles pannes.
- **Détection et notification découplées** : changer de canal d'alerte sans toucher à la détection.

## Late data / clock drift

- **Deux timestamps** : `ts` (mesure, envoyé par le capteur) et `received_at` (réception serveur, `now()`).
- L'écart `received_at - ts` = latence ou coupure réseau.
- L'horodatage côté appareil est peu fiable (horloge non maîtrisée) → `received_at` est le seul de confiance.

---

## Batch vs ligne par ligne

- Insérer par lot (`executemany`) ≈ **5× plus rapide** (mesuré) — économise les allers-retours réseau. L'écart grandit avec le volume.
- Pour insérer par lot depuis MQTT : accumuler dans un tampon, vider tous les N messages.
