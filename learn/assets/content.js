// Genere par learn/build.py — ne pas editer a la main.
// Source : docs/NOTES.md, docs/DEBUG.md, docs/FRICTIONS.md
window.IOT_CONTENT = {
 "docs": [
  {
   "id": "notes",
   "label": "Notes",
   "kicker": "Les notions",
   "verb": "Reviser",
   "title": "Notes entretien — projet télémétrie IoT",
   "titleq": "Notes entretien — projet télémétrie IoT",
   "lead": "Fiche courte. Une notion = une ou deux lignes. Pour réviser, pas pour apprendre.",
   "intro": [
    {
     "type": "p",
     "html": "Fiche courte. Une notion = une ou deux lignes. Pour réviser, pas pour apprendre.",
     "q": "Fiche courte. Une notion = une ou deux lignes. Pour réviser, pas pour apprendre."
    }
   ],
   "sections": [
    {
     "id": "architecture-du-projet",
     "title": "Architecture du projet",
     "short": "Architecture du projet",
     "q": "Architecture du projet",
     "group": 0,
     "blocks": [
      {
       "type": "code",
       "text": "sender ──▶ broker MQTT ──▶ receiver (ingestion) ──▶ TimescaleDB ──▶ API ──▶ Grafana\n                                                          └──▶ surveillance ──▶ Telegram"
      },
      {
       "type": "list",
       "items": [
        {
         "term": "Un seul écrivain",
         "def": "le receiver écrit en base. L'API et la surveillance ne font que lire.",
         "q": "Un seul écrivain le receiver écrit en base. L'API et la surveillance ne font que lire."
        },
        {
         "text": "4 services séparés, 1 responsabilité chacun. On peut redémarrer l'un sans les autres.",
         "q": "4 services séparés, 1 responsabilité chacun. On peut redémarrer l'un sans les autres."
        },
        {
         "text": "Le topic porte l'identité (<code>voligle/telemetry/&lt;device&gt;/&lt;sensor&gt;</code>), le payload porte la valeur.",
         "q": "Le topic porte l'identité (voligle/telemetry/<device>/<sensor>), le payload porte la valeur."
        }
       ]
      }
     ]
    },
    {
     "id": "mqtt",
     "title": "MQTT",
     "short": "MQTT",
     "q": "MQTT",
     "group": 1,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "term": "QoS 0",
         "def": "envoie et oublie, peut perdre",
         "q": "QoS 0 envoie et oublie, peut perdre"
        },
        {
         "term": "QoS 1",
         "def": "au moins une fois, doublons possibles",
         "q": "QoS 1 au moins une fois, doublons possibles"
        },
        {
         "term": "QoS 2",
         "def": "exactement une fois, handshake 4 temps",
         "q": "QoS 2 exactement une fois, handshake 4 temps"
        },
        {
         "term": "LWT",
         "def": "message que le broker envoie <em>pour</em> l'appareil quand il tombe (l'appareil mort ne peut pas s'annoncer lui-même).",
         "q": "LWT message que le broker envoie pour l'appareil quand il tombe (l'appareil mort ne peut pas s'annoncer lui-même)."
        },
        {
         "term": "Retained",
         "def": "le broker garde le dernier message ; un nouvel abonné le reçoit tout de suite.",
         "q": "Retained le broker garde le dernier message ; un nouvel abonné le reçoit tout de suite."
        },
        {
         "term": "Wildcards",
         "def": "<code>+</code> = un niveau, <code>#</code> = tous les niveaux restants (en dernier).",
         "q": "Wildcards + = un niveau, # = tous les niveaux restants (en dernier)."
        },
        {
         "term": "Session persistante",
         "def": "le broker garde les messages d'un abonné absent SI <code>clean_start=False</code> + <code>client_id</code> fixe + QoS ≥ 1. Sinon les messages sont perdus.",
         "q": "Session persistante le broker garde les messages d'un abonné absent SI clean_start=False + client_id fixe + QoS ≥ 1. Sinon les messages sont perdus."
        },
        {
         "term": "client_id",
         "def": "identité d'un client, unique à un instant donné, stable dans le temps.",
         "q": "client_id identité d'un client, unique à un instant donné, stable dans le temps."
        },
        {
         "term": "Contrat de message",
         "def": "le broker ne valide rien, il transporte des octets. Producteur et consommateur doivent s'accorder sur la forme <i class=\"ar\">→</i> on valide à l'ingestion.",
         "q": "Contrat de message le broker ne valide rien, il transporte des octets. Producteur et consommateur doivent s'accorder sur la forme → on valide à l'ingestion."
        }
       ]
      }
     ]
    },
    {
     "id": "protocoles-la-question-qui-tranche-sur-pile-ou-secteur-combien-de-donnees",
     "title": "Protocoles (la question qui tranche : sur pile ou secteur ? combien de données ?)",
     "short": "Protocoles",
     "q": "Protocoles (la question qui tranche : sur pile ou secteur ? combien de données ?)",
     "group": 1,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "term": "LoRaWAN",
         "def": "très longue portée, très basse conso, débit minuscule. Capteurs dispersés.",
         "q": "LoRaWAN très longue portée, très basse conso, débit minuscule. Capteurs dispersés."
        },
        {
         "term": "NB-IoT",
         "def": "cellulaire opérateur, pas d'infra à déployer, une SIM. Abonnement par appareil.",
         "q": "NB-IoT cellulaire opérateur, pas d'infra à déployer, une SIM. Abonnement par appareil."
        },
        {
         "term": "BLE",
         "def": "courte portée, basse conso. Communication avec un téléphone/passerelle proche.",
         "q": "BLE courte portée, basse conso. Communication avec un téléphone/passerelle proche."
        },
        {
         "term": "Zigbee",
         "def": "basse conso, maillé (chaque appareil relaie). Domotique.",
         "q": "Zigbee basse conso, maillé (chaque appareil relaie). Domotique."
        },
        {
         "term": "Wi-Fi",
         "def": "gros débit, forte conso. Sur secteur, gros volume (caméras).",
         "q": "Wi-Fi gros débit, forte conso. Sur secteur, gros volume (caméras)."
        }
       ]
      }
     ]
    },
    {
     "id": "docker",
     "title": "Docker",
     "short": "Docker",
     "q": "Docker",
     "group": 2,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "term": "Image vs conteneur",
         "def": "image = la classe (le .dmg), conteneur = l'objet (l'app qui tourne). Une image, plusieurs conteneurs.",
         "q": "Image vs conteneur image = la classe (le .dmg), conteneur = l'objet (l'app qui tourne). Une image, plusieurs conteneurs."
        },
        {
         "term": "Port <code>-p HOTE:CONTENEUR</code>",
         "def": "gauche = ma machine, droite = l'intérieur. Sans mapping, le conteneur est isolé du réseau de l'hôte.",
         "q": "Port -p HOTE:CONTENEUR gauche = ma machine, droite = l'intérieur. Sans mapping, le conteneur est isolé du réseau de l'hôte."
        },
        {
         "term": "Volume",
         "def": "le conteneur est éphémère ; tout état qui doit survivre passe par un volume (monté sur le répertoire de données, ex. PGDATA — contient tables ET config).",
         "q": "Volume le conteneur est éphémère ; tout état qui doit survivre passe par un volume (monté sur le répertoire de données, ex. PGDATA — contient tables ET config)."
        },
        {
         "term": "Bind mount vs volume nommé",
         "def": "bind mount (<code>./config:/config</code>) = on <strong>fournit</strong> des fichiers au conteneur (config, mots de passe). Volume nommé (<code>pgdata:/var/lib/...</code>) = le conteneur <strong>écrit</strong> ses données, géré par Docker.",
         "q": "Bind mount vs volume nommé bind mount (./config:/config) = on fournit des fichiers au conteneur (config, mots de passe). Volume nommé (pgdata:/var/lib/...) = le conteneur écrit ses données, géré par Docker."
        },
        {
         "term": "Services sans état",
         "def": "(API, ingestion, surveillance) = pas de volume, jetables. Seule la base porte l'état.",
         "q": "Services sans état (API, ingestion, surveillance) = pas de volume, jetables. Seule la base porte l'état."
        },
        {
         "term": "Les fichiers permanents vivent sur l'HÔTE",
         "def": ", pas dans les conteneurs. On les crée sur l'hôte (<code>touch</code>, <code>nano</code>, <code>mkdir</code>) ; les conteneurs les lisent via les volumes. Un fichier créé DANS un conteneur disparaît à sa recréation (sauf sur un volume).",
         "q": "Les fichiers permanents vivent sur l'HÔTE , pas dans les conteneurs. On les crée sur l'hôte (touch, nano, mkdir) ; les conteneurs les lisent via les volumes. Un fichier créé DANS un conteneur disparaît à sa recréation (sauf sur un volume)."
        },
        {
         "term": "Fichier au contenu spécial",
         "def": "(ex. mot de passe haché) : on emprunte l'outil depuis une image (<code>docker run ... mosquitto_passwd</code>) pour générer le bon format, mais le fichier atterrit sur l'hôte.",
         "q": "Fichier au contenu spécial (ex. mot de passe haché) : on emprunte l'outil depuis une image (docker run ... mosquitto_passwd) pour générer le bon format, mais le fichier atterrit sur l'hôte."
        },
        {
         "term": "Un fichier créé par un conteneur appartient à <code>root</code>",
         "def": "sur l'hôte (le conteneur tourne en root par défaut) <i class=\"ar\">→</i> souvent illisible par le process qui en a besoin. Vérifier propriétaire + permissions.",
         "q": "Un fichier créé par un conteneur appartient à root sur l'hôte (le conteneur tourne en root par défaut) → souvent illisible par le process qui en a besoin. Vérifier propriétaire + permissions."
        },
        {
         "term": "Réseau",
         "def": "code sur ma machine <i class=\"ar\">→</i> <code>localhost:port</code> (si port exposé). Code dans un conteneur <i class=\"ar\">→</i> nom du service (Compose crée le réseau tout seul ; <code>docker run</code> isolé = non).",
         "q": "Réseau code sur ma machine → localhost:port (si port exposé). Code dans un conteneur → nom du service (Compose crée le réseau tout seul ; docker run isolé = non)."
        }
       ]
      }
     ]
    },
    {
     "id": "docker-compose",
     "title": "Docker Compose",
     "short": "Docker Compose",
     "q": "Docker Compose",
     "group": 2,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "text": "Décrit toute la stack dans un fichier, lancée par <code>docker compose up -d</code>.",
         "q": "Décrit toute la stack dans un fichier, lancée par docker compose up -d."
        },
        {
         "text": "Réponse à « comment quelqu'un lance ton projet ? ».",
         "q": "Réponse à « comment quelqu'un lance ton projet ? »."
        },
        {
         "text": "Compose isole ses ressources sous un nom de projet (volumes/réseaux préfixés). Pour réutiliser un volume existant : <code>external: true</code>.",
         "q": "Compose isole ses ressources sous un nom de projet (volumes/réseaux préfixés). Pour réutiliser un volume existant : external: true."
        }
       ]
      }
     ]
    },
    {
     "id": "dockerfile-images",
     "title": "Dockerfile / images",
     "short": "Dockerfile / images",
     "q": "Dockerfile / images",
     "group": 2,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "term": "Dockerfile",
         "def": "= recette pour construire MON image (mon code). <strong>Compose</strong> = menu qui assemble les services (images publiques + la mienne).",
         "q": "Dockerfile = recette pour construire MON image (mon code). Compose = menu qui assemble les services (images publiques + la mienne)."
        },
        {
         "text": "Image légère = <code>python:slim</code> + <code>.dockerignore</code> (exclure <code>.venv</code>, <code>.git</code>, <code>.env</code>, caches).",
         "q": "Image légère = python:slim + .dockerignore (exclure .venv, .git, .env, caches)."
        },
        {
         "term": "Cache de couches",
         "def": "copier <code>requirements.txt</code> AVANT le code <i class=\"ar\">→</i> si seul le code change, <code>pip install</code> est réutilisé depuis le cache.",
         "q": "Cache de couches copier requirements.txt AVANT le code → si seul le code change, pip install est réutilisé depuis le cache."
        },
        {
         "term": "Multi-étapes",
         "def": "builder lourd (outils de compilation) <i class=\"ar\">→</i> copie du résultat <i class=\"ar\">→</i> image finale légère. Sépare construction et exécution. Utile surtout quand il faut compiler. (Pas utilisé ici car <code>psycopg-binary</code> est déjà compilé.)",
         "q": "Multi-étapes builder lourd (outils de compilation) → copie du résultat → image finale légère. Sépare construction et exécution. Utile surtout quand il faut compiler. (Pas utilisé ici car psycopg-binary est déjà compilé.)"
        },
        {
         "term": "Une image, plusieurs services",
         "def": "même image, <code>command:</code> différent par service.",
         "q": "Une image, plusieurs services : même image, command: différent par service."
        },
        {
         "text": "Jamais de <code>-e /chemin/local</code> dans le requirements destiné à Docker (chemin absolu inexistant dans l'image).",
         "q": "Jamais de -e /chemin/local dans le requirements destiné à Docker (chemin absolu inexistant dans l'image)."
        }
       ]
      }
     ]
    },
    {
     "id": "aws-iot-core-broker-manage",
     "title": "AWS IoT Core (broker managé)",
     "short": "AWS IoT Core",
     "q": "AWS IoT Core (broker managé)",
     "group": 3,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "text": "Broker MQTT <strong>géré par AWS</strong> : rien à installer/maintenir/sécuriser, monte à des millions d'appareils tout seul.",
         "q": "Broker MQTT géré par AWS : rien à installer/maintenir/sécuriser, monte à des millions d'appareils tout seul."
        },
        {
         "term": "vs mon Mosquitto",
         "def": "pas de serveur à gérer, sécurité par <strong>certificats X.509</strong> (un par appareil, révocable), pas mot de passe partagé.",
         "q": "vs mon Mosquitto : pas de serveur à gérer, sécurité par certificats X.509 (un par appareil, révocable), pas mot de passe partagé."
        },
        {
         "term": "Rules Engine",
         "def": "route les messages directement vers d'autres services AWS (base, Lambda, stockage) <i class=\"ar\">→</i> remplace le service d'ingestion.",
         "q": "Rules Engine route les messages directement vers d'autres services AWS (base, Lambda, stockage) → remplace le service d'ingestion."
        },
        {
         "term": "Device Shadow",
         "def": "jumeau cloud de chaque appareil, garde le dernier état connu même hors ligne.",
         "q": "Device Shadow jumeau cloud de chaque appareil, garde le dernier état connu même hors ligne."
        },
        {
         "term": "Compromis",
         "def": "Mosquitto = contrôle total, pas de coût récurrent, mais je gère tout. IoT Core = rien à gérer, scalable, mais coût à l'usage + dépendance AWS (lock-in).",
         "q": "Compromis Mosquitto = contrôle total, pas de coût récurrent, mais je gère tout. IoT Core = rien à gérer, scalable, mais coût à l'usage + dépendance AWS (lock-in)."
        }
       ]
      }
     ]
    },
    {
     "id": "cross-arch-deploiement-flotte",
     "title": "Cross-arch / déploiement flotte",
     "short": "Cross-arch / déploiement flotte",
     "q": "Cross-arch / déploiement flotte",
     "group": 3,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "term": "Une image Docker est TOUJOURS Linux",
         "def": "(jamais macOS). <code>python:slim</code> = Debian minimal + Python. Sur Mac, Docker fait tourner une VM Linux cachée (d'où la conso RAM).",
         "q": "Une image Docker est TOUJOURS Linux (jamais macOS). python:slim = Debian minimal + Python. Sur Mac, Docker fait tourner une VM Linux cachée (d'où la conso RAM)."
        },
        {
         "term": "ARM vs x86",
         "def": "un Raspberry est ARM, on développe souvent en x86. Une image x86 ne tourne pas sur ARM (jeux d'instructions différents).",
         "q": "ARM vs x86 un Raspberry est ARM, on développe souvent en x86. Une image x86 ne tourne pas sur ARM (jeux d'instructions différents)."
        },
        {
         "term": "Architecture de l'image = celle de la machine de build",
         "def": "par défaut. Mac Apple Silicon <i class=\"ar\">→</i> image ARM (tourne sur Pi) ; Mac Intel <i class=\"ar\">→</i> image x86 (ne tourne pas sur Pi).",
         "q": "Architecture de l'image = celle de la machine de build par défaut. Mac Apple Silicon → image ARM (tourne sur Pi) ; Mac Intel → image x86 (ne tourne pas sur Pi)."
        },
        {
         "term": "<code>docker buildx</code>",
         "def": "construire pour une autre architecture, ou multi-arch (chaque machine prend la bonne). Indispensable pour déployer d'un x86 vers des appareils ARM.",
         "q": "docker buildx construire pour une autre architecture, ou multi-arch (chaque machine prend la bonne). Indispensable pour déployer d'un x86 vers des appareils ARM."
        },
        {
         "term": "balena",
         "def": "(déjà utilisé pro) : déploiement de flotte, <strong>mises à jour delta</strong> = n'envoyer que la différence entre deux images. Crucial sur connexions limitées.",
         "q": "balena (déjà utilisé pro) : déploiement de flotte, mises à jour delta = n'envoyer que la différence entre deux images. Crucial sur connexions limitées."
        }
       ]
      }
     ]
    },
    {
     "id": "sql",
     "title": "SQL",
     "short": "SQL",
     "q": "SQL",
     "group": 3,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "term": "Ordre d'exécution",
         "def": "FROM <i class=\"ar\">→</i> WHERE <i class=\"ar\">→</i> GROUP BY <i class=\"ar\">→</i> SELECT <i class=\"ar\">→</i> ORDER BY. (Donc WHERE ne connaît pas les alias du SELECT ; ORDER BY oui.)",
         "q": "Ordre d'exécution FROM → WHERE → GROUP BY → SELECT → ORDER BY. (Donc WHERE ne connaît pas les alias du SELECT ; ORDER BY oui.)"
        },
        {
         "term": "JOIN (= INNER)",
         "def": "garde seulement les correspondances des deux côtés.",
         "q": "JOIN (= INNER) garde seulement les correspondances des deux côtés."
        },
        {
         "term": "LEFT JOIN",
         "def": "garde tout à gauche, NULL à droite quand il manque.",
         "q": "LEFT JOIN garde tout à gauche, NULL à droite quand il manque."
        },
        {
         "term": "Trouver ce qui manque",
         "def": "<code>LEFT JOIN ... WHERE col_droite IS NULL</code>. (<code>IS NULL</code>, jamais <code>= NULL</code>.)",
         "q": "Trouver ce qui manque LEFT JOIN ... WHERE col_droite IS NULL. (IS NULL, jamais = NULL.)"
        },
        {
         "text": "<strong>Mettre à gauche ce qu'on veut garder en entier.</strong>",
         "q": "Mettre à gauche ce qu'on veut garder en entier.",
         "statement": true
        },
        {
         "term": "GROUP BY",
         "def": "transforme les lignes en paquets ; le SELECT ne contient que des colonnes groupées ou des agrégats (AVG, COUNT...).",
         "q": "GROUP BY transforme les lignes en paquets ; le SELECT ne contient que des colonnes groupées ou des agrégats (AVG, COUNT...)."
        },
        {
         "term": "HAVING",
         "def": "comme WHERE mais après le GROUP BY (filtre sur un agrégat).",
         "q": "HAVING comme WHERE mais après le GROUP BY (filtre sur un agrégat)."
        },
        {
         "term": "Fonction fenêtre",
         "def": "calcul par ligne SANS écraser. <code>PARTITION BY</code> = paquets, <code>LAG</code> = ligne précédente.",
         "q": "Fonction fenêtre calcul par ligne SANS écraser. PARTITION BY = paquets, LAG = ligne précédente."
        },
        {
         "term": "Index",
         "def": "(sensor_id, ts DESC) : ordre des colonnes = ordre du filtrage (d'abord le capteur, puis le temps). Accélère la lecture, ralentit l'écriture <i class=\"ar\">→</i> on indexe selon les requêtes réelles.",
         "q": "Index (sensor_id, ts DESC) : ordre des colonnes = ordre du filtrage (d'abord le capteur, puis le temps). Accélère la lecture, ralentit l'écriture → on indexe selon les requêtes réelles."
        },
        {
         "term": "<code>%s</code>, jamais f-string",
         "def": "le driver envoie requête et valeurs séparément <i class=\"ar\">→</i> protège de l'injection SQL.",
         "q": "%s, jamais f-string le driver envoie requête et valeurs séparément → protège de l'injection SQL."
        }
       ]
      }
     ]
    },
    {
     "id": "timestamps",
     "title": "Timestamps",
     "short": "Timestamps",
     "q": "Timestamps",
     "group": 3,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "term": "TIMESTAMPTZ",
         "def": "(avec fuseau), jamais TIMESTAMP. Appareils dans plusieurs pays, serveur UTC.",
         "q": "TIMESTAMPTZ (avec fuseau), jamais TIMESTAMP. Appareils dans plusieurs pays, serveur UTC."
        },
        {
         "term": "INTERVAL",
         "def": "= une durée (<code>30 days</code>, <code>5 minutes</code>). <code>now() - INTERVAL</code> = « depuis tant de temps ».",
         "q": "INTERVAL = une durée (30 days, 5 minutes). now() - INTERVAL = « depuis tant de temps »."
        }
       ]
      }
     ]
    },
    {
     "id": "transactions",
     "title": "Transactions",
     "short": "Transactions",
     "q": "Transactions",
     "group": 3,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "term": "Transaction",
         "def": "= groupe de commandes tout-ou-rien ; rien d'écrit tant que pas de <strong>commit</strong>.",
         "q": "Transaction = groupe de commandes tout-ou-rien ; rien d'écrit tant que pas de commit."
        },
        {
         "term": "autocommit=True",
         "def": "= chaque commande validée seule. (Nécessaire pour créer un agrégat continu : refuse d'être dans une transaction.)",
         "q": "autocommit=True = chaque commande validée seule. (Nécessaire pour créer un agrégat continu : refuse d'être dans une transaction.)"
        }
       ]
      }
     ]
    },
    {
     "id": "timescaledb",
     "title": "TimescaleDB",
     "short": "TimescaleDB",
     "q": "TimescaleDB",
     "group": 4,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "term": "Hypertable",
         "def": "table Postgres découpée automatiquement par le temps en <em>chunks</em>. Même SQL, plus rapide sur gros volumes. Transparent pour les clients (Grafana).",
         "q": "Hypertable table Postgres découpée automatiquement par le temps en chunks. Même SQL, plus rapide sur gros volumes. Transparent pour les clients (Grafana)."
        },
        {
         "term": "Clé",
         "def": "la colonne de temps (<code>ts</code>) doit faire partie de la clé primaire <i class=\"ar\">→</i> <code>PRIMARY KEY (id, ts)</code>.",
         "q": "Clé la colonne de temps (ts) doit faire partie de la clé primaire → PRIMARY KEY (id, ts)."
        },
        {
         "term": "Agrégat continu",
         "def": "= vue matérialisée (résultat stocké) que Timescale rafraîchit toute seule via un job périodique. Pré-calcul <i class=\"ar\">→</i> dashboard rapide.",
         "q": "Agrégat continu = vue matérialisée (résultat stocké) que Timescale rafraîchit toute seule via un job périodique. Pré-calcul → dashboard rapide."
        },
        {
         "term": "≠ temps réel",
         "def": "job en arrière-plan, pas à chaque insertion. Tendances <i class=\"ar\">→</i> agrégat ; alertes <i class=\"ar\">→</i> requête directe.",
         "q": "≠ temps réel job en arrière-plan, pas à chaque insertion. Tendances → agrégat ; alertes → requête directe."
        },
        {
         "term": "Rétention",
         "def": "<code>add_retention_policy</code> supprime les vieux chunks (rapide car par chunk entier). Les moyennes horaires ne sont pas touchées.",
         "q": "Rétention add_retention_policy supprime les vieux chunks (rapide car par chunk entier). Les moyennes horaires ne sont pas touchées."
        },
        {
         "term": "Migration sans perte",
         "def": "changer l'image (volume gardé) <i class=\"ar\">→</i> <code>ALTER</code> pour mettre <code>ts</code> dans la clé <i class=\"ar\">→</i> <code>create_hypertable(migrate_data =&gt; true)</code>. Compte identique avant/après.",
         "q": "Migration sans perte changer l'image (volume gardé) → ALTER pour mettre ts dans la clé → create_hypertable(migrate_data => true). Compte identique avant/après."
        }
       ]
      }
     ]
    },
    {
     "id": "api-fastapi",
     "title": "API (FastAPI)",
     "short": "API",
     "q": "API (FastAPI)",
     "group": 5,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "text": "Une API est une <strong>façade</strong> : elle expose des questions, pas la base. Protège la base, contrôle le volume renvoyé (<code>LIMIT</code>), découple les clients du stockage.",
         "q": "Une API est une façade : elle expose des questions, pas la base. Protège la base, contrôle le volume renvoyé (LIMIT), découple les clients du stockage."
        },
        {
         "term": "Pydantic",
         "def": "(<code>BaseModel</code>) : on déclare la forme attendue, FastAPI valide le corps et renvoie <strong>422</strong> si invalide, sans code manuel.",
         "q": "Pydantic (BaseModel) : on déclare la forme attendue, FastAPI valide le corps et renvoie 422 si invalide, sans code manuel."
        },
        {
         "term": "Path param",
         "def": "(dans l'URL) vs <strong>query param</strong> (après le <code>?</code>) vs <strong>corps</strong> (JSON, typé BaseModel).",
         "q": "Path param (dans l'URL) vs query param (après le ?) vs corps (JSON, typé BaseModel)."
        },
        {
         "term": "Pagination",
         "def": "<code>LIMIT</code>/<code>OFFSET</code>, avec un plafond imposé par le serveur (<code>min(limit, 1000)</code>). (OFFSET lent sur gros volumes <i class=\"ar\">→</i> pagination par curseur.)",
         "q": "Pagination LIMIT/OFFSET, avec un plafond imposé par le serveur (min(limit, 1000)). (OFFSET lent sur gros volumes → pagination par curseur.)"
        },
        {
         "term": "Codes",
         "def": "404 ressource inconnue, 422 requête malformée, 401 non authentifié, 500 erreur serveur.",
         "q": "Codes 404 ressource inconnue, 422 requête malformée, 401 non authentifié, 500 erreur serveur."
        },
        {
         "term": "Optimisation",
         "def": "souvent au niveau base (index, pré-agrégation), pas dans le Python.",
         "q": "Optimisation souvent au niveau base (index, pré-agrégation), pas dans le Python."
        }
       ]
      }
     ]
    },
    {
     "id": "ci-github-actions",
     "title": "CI / GitHub Actions",
     "short": "CI / GitHub Actions",
     "q": "CI / GitHub Actions",
     "group": 5,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "term": "CI (intégration continue)",
         "def": "= vérifications automatiques à chaque push. Filet de sécurité avant que le code atteigne le serveur.",
         "q": "CI (intégration continue) = vérifications automatiques à chaque push. Filet de sécurité avant que le code atteigne le serveur."
        },
        {
         "text": "Fichier <code>.github/workflows/ci.yml</code> : GitHub lance une machine Linux jetable, installe le projet, exécute les vérifications.",
         "q": "Fichier .github/workflows/ci.yml : GitHub lance une machine Linux jetable, installe le projet, exécute les vérifications."
        },
        {
         "text": "<code>on: [push]</code> = déclencheur. <code>runs-on: ubuntu-latest</code> = machine fournie. <code>checkout</code> récupère le code, <code>setup-python</code> installe Python.",
         "q": "on: [push] = déclencheur. runs-on: ubuntu-latest = machine fournie. checkout récupère le code, setup-python installe Python."
        },
        {
         "term": "Ma CI",
         "def": "<code>pip install -r requirements.txt</code> (les dépendances s'installent) + <code>compileall src/</code> (pas d'erreur de syntaxe). À enrichir avec pytest.",
         "q": "Ma CI : pip install -r requirements.txt (les dépendances s'installent) + compileall src/ (pas d'erreur de syntaxe). À enrichir avec pytest."
        },
        {
         "text": "Badge vert sur le repo = signal de sérieux visible par un recruteur.",
         "q": "Badge vert sur le repo = signal de sérieux visible par un recruteur."
        }
       ]
      }
     ]
    },
    {
     "id": "securite-secrets",
     "title": "Sécurité / secrets",
     "short": "Sécurité / secrets",
     "q": "Sécurité / secrets",
     "group": 5,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "term": "Jamais de secret en dur.",
         "def": "<code>os.getenv</code> + <code>.env</code> gitignoré (dev), gestionnaire de secrets (prod).",
         "q": "Jamais de secret en dur. os.getenv + .env gitignoré (dev), gestionnaire de secrets (prod)."
        },
        {
         "text": "<code>export</code> = temporaire (terminal). <code>.env</code> + <code>load_dotenv()</code> = persistant.",
         "q": "export = temporaire (terminal). .env + load_dotenv() = persistant."
        },
        {
         "term": "Config central",
         "def": "une variable lue à plusieurs endroits ou qui a besoin d'un traitement <i class=\"ar\">→</i> un seul point de lecture (<code>config.py</code>). Sinon <code>os.getenv</code> direct suffit.",
         "q": "Config central une variable lue à plusieurs endroits ou qui a besoin d'un traitement → un seul point de lecture (config.py). Sinon os.getenv direct suffit."
        },
        {
         "term": "Clé d'API",
         "def": "en-tête <code>X-API-Key</code>, vérifié via une dépendance FastAPI (<code>Depends</code>).",
         "q": "Clé d'API en-tête X-API-Key, vérifié via une dépendance FastAPI (Depends)."
        },
        {
         "term": "Mosquitto",
         "def": "<code>allow_anonymous false</code> + fichier de mots de passe. Auth = qui se connecte ; TLS = chiffrer le transit (utile au déploiement, pas en local).",
         "q": "Mosquitto allow_anonymous false + fichier de mots de passe. Auth = qui se connecte ; TLS = chiffrer le transit (utile au déploiement, pas en local)."
        },
        {
         "term": "Mot de passe Mosquitto",
         "def": "vit à 2 endroits : en clair dans <code>.env</code> (lu par le code), haché dans <code>passwd</code> (vérifié par le broker). Les deux hors de git. Changer le mdp = mettre à jour les deux.",
         "q": "Mot de passe Mosquitto vit à 2 endroits : en clair dans .env (lu par le code), haché dans passwd (vérifié par le broker). Les deux hors de git. Changer le mdp = mettre à jour les deux."
        },
        {
         "term": "Fichier <code>passwd</code>",
         "def": "mots de passe hachés, jamais en clair. Mosquitto re-hache ce qu'on envoie et compare (<code>mosquitto_passwd -c</code> crée/écrase, sans <code>-c</code> = ajoute/modifie).",
         "q": "Fichier passwd mots de passe hachés, jamais en clair. Mosquitto re-hache ce qu'on envoie et compare (mosquitto_passwd -c crée/écrase, sans -c = ajoute/modifie)."
        },
        {
         "term": "Gestion d'accès",
         "def": "comptes par appareil/groupe, révocation d'un accès sans couper les autres. <strong>ACL</strong> = restreindre qui publie/lit quels topics (un capteur ne publie que sur son topic, le dashboard ne fait que lire).",
         "q": "Gestion d'accès comptes par appareil/groupe, révocation d'un accès sans couper les autres. ACL = restreindre qui publie/lit quels topics (un capteur ne publie que sur son topic, le dashboard ne fait que lire)."
        }
       ]
      }
     ]
    },
    {
     "id": "visualisation-grafana",
     "title": "Visualisation (Grafana)",
     "short": "Visualisation",
     "q": "Visualisation (Grafana)",
     "group": 6,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "term": "AS time",
         "def": "désigne la colonne de l'axe temporel (obligatoire pour Time series, inutile pour Table/Stat).",
         "q": "AS time désigne la colonne de l'axe temporel (obligatoire pour Time series, inutile pour Table/Stat)."
        },
        {
         "term": "$__timeFilter(ts)",
         "def": "relie la requête au sélecteur de plage <i class=\"ar\">→</i> navigation dans le temps.",
         "q": "$__timeFilter(ts) relie la requête au sélecteur de plage → navigation dans le temps."
        },
        {
         "text": "Même requête <i class=\"ar\">→</i> Table (valeur exacte) ou Time series (tendance). La visualisation est une couche de présentation.",
         "q": "Même requête → Table (valeur exacte) ou Time series (tendance). La visualisation est une couche de présentation."
        }
       ]
      }
     ]
    },
    {
     "id": "detection-alertes",
     "title": "Détection &amp; alertes",
     "short": "Détection &amp; alertes",
     "q": "Détection & alertes",
     "group": 6,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "term": "Capteur silencieux",
         "def": "dernière mesure trop vieille. <code>now() - MAX(ts) &gt; seuil</code>. Seuil = quelques fois la période d'émission.",
         "q": "Capteur silencieux dernière mesure trop vieille. now() - MAX(ts) > seuil. Seuil = quelques fois la période d'émission."
        },
        {
         "term": "Déduplication",
         "def": "alerter au passage vivant<i class=\"ar\">→</i>mort, se taire ensuite. Opérations d'ensembles : <code>silencieux - deja_signales</code> = nouvelles pannes.",
         "q": "Déduplication alerter au passage vivant→mort, se taire ensuite. Opérations d'ensembles : silencieux - deja_signales = nouvelles pannes."
        },
        {
         "term": "Détection et notification découplées",
         "def": "changer de canal d'alerte sans toucher à la détection.",
         "q": "Détection et notification découplées changer de canal d'alerte sans toucher à la détection."
        }
       ]
      }
     ]
    },
    {
     "id": "late-data-clock-drift",
     "title": "Late data / clock drift",
     "short": "Late data / clock drift",
     "q": "Late data / clock drift",
     "group": 6,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "term": "Deux timestamps",
         "def": "<code>ts</code> (mesure, envoyé par le capteur) et <code>received_at</code> (réception serveur, <code>now()</code>).",
         "q": "Deux timestamps ts (mesure, envoyé par le capteur) et received_at (réception serveur, now())."
        },
        {
         "text": "L'écart <code>received_at - ts</code> = latence ou coupure réseau.",
         "q": "L'écart received_at - ts = latence ou coupure réseau."
        },
        {
         "text": "L'horodatage côté appareil est peu fiable (horloge non maîtrisée) <i class=\"ar\">→</i> <code>received_at</code> est le seul de confiance.",
         "q": "L'horodatage côté appareil est peu fiable (horloge non maîtrisée) → received_at est le seul de confiance."
        }
       ]
      }
     ]
    },
    {
     "id": "batch-vs-ligne-par-ligne",
     "title": "Batch vs ligne par ligne",
     "short": "Batch vs ligne par ligne",
     "q": "Batch vs ligne par ligne",
     "group": 7,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "text": "Insérer par lot (<code>executemany</code>) ≈ <strong>5× plus rapide</strong> (mesuré) — économise les allers-retours réseau. L'écart grandit avec le volume.",
         "q": "Insérer par lot (executemany) ≈ 5× plus rapide (mesuré) — économise les allers-retours réseau. L'écart grandit avec le volume."
        },
        {
         "term": "Pour insérer par lot depuis MQTT",
         "def": "accumuler dans un tampon, vider tous les N messages.",
         "q": "Pour insérer par lot depuis MQTT : accumuler dans un tampon, vider tous les N messages."
        }
       ]
      }
     ]
    }
   ],
   "source": "docs/NOTES.md"
  },
  {
   "id": "debug",
   "label": "Debug",
   "kicker": "Les pannes",
   "verb": "Enqueter",
   "title": "Problèmes rencontrés — et comment je les ai résolus",
   "titleq": "Problèmes rencontrés — et comment je les ai résolus",
   "lead": "Les vrais bugs du projet. Utile en entretien : « racontez un problème que vous avez débogué ».",
   "intro": [
    {
     "type": "p",
     "html": "Les vrais bugs du projet. Utile en entretien : « racontez un problème que vous avez débogué ».",
     "q": "Les vrais bugs du projet. Utile en entretien : « racontez un problème que vous avez débogué »."
    }
   ],
   "sections": [
    {
     "id": "mqtt",
     "title": "MQTT",
     "short": "MQTT",
     "q": "MQTT",
     "group": 0,
     "blocks": [
      {
       "type": "entry",
       "title": "Rien n'arrive côté receiver, aucune erreur.",
       "q": "Rien n'arrive côté receiver, aucune erreur.",
       "body": "Le sender publiait sur un topic qui ne correspondait pas au filtre d'abonnement.",
       "bodyq": "Le sender publiait sur un topic qui ne correspondait pas au filtre d'abonnement.",
       "fixes": [
        {
         "kind": "fix",
         "html": "Isoler avec <code>mosquitto_sub -t \"#\" -v</code> : si ça défile, le sender va bien, c'est le filtre. Sinon, c'est le sender.",
         "q": "Isoler avec mosquitto_sub -t \"#\" -v : si ça défile, le sender va bien, c'est le filtre. Sinon, c'est le sender."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "Le payload arrive mais <code>device_id</code> vaut \"inconnu\".",
       "q": "Le payload arrive mais device_id vaut \"inconnu\".",
       "body": "Contrat de message rompu : le sender n'envoyait pas la clé attendue. Aucune erreur, le broker transporte des octets sans rien valider.",
       "bodyq": "Contrat de message rompu : le sender n'envoyait pas la clé attendue. Aucune erreur, le broker transporte des octets sans rien valider.",
       "fixes": [
        {
         "kind": "fix",
         "html": "Corriger le <strong>sender</strong> (pas le receiver), pour que le contrat devienne la référence du projet.",
         "q": "Corriger le sender (pas le receiver), pour que le contrat devienne la référence du projet."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "Le dict partagé reste vide alors que les prints s'affichent.",
       "q": "Le dict partagé reste vide alors que les prints s'affichent.",
       "body": "Deux causes possibles : réassignation d'une variable locale au lieu de muter le dict global, ou deux processus séparés (deux mémoires distinctes).",
       "bodyq": "Deux causes possibles : réassignation d'une variable locale au lieu de muter le dict global, ou deux processus séparés (deux mémoires distinctes).",
       "fixes": [
        {
         "kind": "fix",
         "html": "Un dict en mémoire ne se partage ni entre processus ni après redémarrage <i class=\"ar\">→</i> passer en base.",
         "q": "Un dict en mémoire ne se partage ni entre processus ni après redémarrage → passer en base."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "<code>clean_start=False</code> <i class=\"ar\">→</i> <code>ValueError: Clean start only applies to MQTT V5</code>.",
       "q": "clean_start=False → ValueError: Clean start only applies to MQTT V5.",
       "body": "Le paramètre n'existe qu'en MQTT v5.",
       "bodyq": "Le paramètre n'existe qu'en MQTT v5.",
       "fixes": [
        {
         "kind": "fix",
         "html": "<code>protocol=mqtt.MQTTv5</code> + <code>Properties(PacketTypes.CONNECT)</code> avec <code>SessionExpiryInterval</code>.",
         "q": "protocol=mqtt.MQTTv5 + Properties(PacketTypes.CONNECT) avec SessionExpiryInterval."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "Le broker accepte encore les connexions après avoir activé l'auth.",
       "q": "Le broker accepte encore les connexions après avoir activé l'auth.",
       "body": "Un ancien conteneur Mosquitto (lancé par <code>docker run</code>) tournait encore sur le port 1883.",
       "bodyq": "Un ancien conteneur Mosquitto (lancé par docker run) tournait encore sur le port 1883.",
       "fixes": [
        {
         "kind": "fix",
         "html": "<code>docker ps | grep 1883</code> pour vérifier qu'il n'y a qu'un seul broker.",
         "q": "docker ps | grep 1883 pour vérifier qu'il n'y a qu'un seul broker."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "<code>Unable to open config file '/mosquitto/config/mosquitto.conf'</code>.",
       "q": "Unable to open config file '/mosquitto/config/mosquitto.conf'.",
       "body": "Le fichier s'appelait <code>mosquitto.config</code> au lieu de <code>mosquitto.conf</code>.",
       "bodyq": "Le fichier s'appelait mosquitto.config au lieu de mosquitto.conf.",
       "fixes": [
        {
         "kind": "fix",
         "html": "Lire le chemin <strong>exact</strong> réclamé dans le message d'erreur et le comparer à ce qu'on a.",
         "q": "Lire le chemin exact réclamé dans le message d'erreur et le comparer à ce qu'on a."
        }
       ],
       "points": []
      }
     ]
    },
    {
     "id": "base-de-donnees",
     "title": "Base de données",
     "short": "Base de données",
     "q": "Base de données",
     "group": 1,
     "blocks": [
      {
       "type": "entry",
       "title": "<code>column \"sensor_id\" does not exist</code> à la création d'un index.",
       "q": "column \"sensor_id\" does not exist à la création d'un index.",
       "body": "<code>CREATE TABLE IF NOT EXISTS</code> vérifie le <strong>nom</strong>, pas la structure. L'ancienne table avec l'ancien schéma était encore là.",
       "bodyq": "CREATE TABLE IF NOT EXISTS vérifie le nom, pas la structure. L'ancienne table avec l'ancien schéma était encore là.",
       "fixes": [
        {
         "kind": "fix",
         "html": "<code>DROP TABLE</code> avant, dans l'ordre inverse des dépendances (readings <i class=\"ar\">→</i> sensors <i class=\"ar\">→</i> devices).",
         "q": "DROP TABLE avant, dans l'ordre inverse des dépendances (readings → sensors → devices)."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "<code>the cursor is closed</code> au <code>fetchall()</code>.",
       "q": "the cursor is closed au fetchall().",
       "body": "Le <code>fetchall()</code> était hors du bloc <code>with conn.cursor()</code>. Le curseur se ferme à la sortie du <code>with</code>.",
       "bodyq": "Le fetchall() était hors du bloc with conn.cursor(). Le curseur se ferme à la sortie du with.",
       "fixes": [
        {
         "kind": "fix",
         "html": "Tout ce qui touche à <code>cur</code> reste dans le <code>with</code>.",
         "q": "Tout ce qui touche à cur reste dans le with."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "<code>extension \"timescaledb\" must be preloaded</code>.",
       "q": "extension \"timescaledb\" must be preloaded.",
       "body": "Le volume contenait la config d'une ancienne base Postgres sans préchargement Timescale.",
       "bodyq": "Le volume contenait la config d'une ancienne base Postgres sans préchargement Timescale.",
       "fixes": [
        {
         "kind": "fix",
         "html": "Le volume garde les données <strong>et</strong> la config. Changer d'image ne suffit pas si la config n'a pas la ligne <code>shared_preload_libraries</code>.",
         "q": "Le volume garde les données et la config. Changer d'image ne suffit pas si la config n'a pas la ligne shared_preload_libraries."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "<code>could not access file \"timescaledb\": No such file or directory</code> — Postgres refuse de démarrer.",
       "q": "could not access file \"timescaledb\": No such file or directory — Postgres refuse de démarrer.",
       "body": "La config demandait de précharger Timescale, mais l'image <code>postgres:16</code> ne contient pas la bibliothèque.",
       "bodyq": "La config demandait de précharger Timescale, mais l'image postgres:16 ne contient pas la bibliothèque.",
       "fixes": [
        {
         "kind": "fix",
         "html": "Il faut <strong>les deux</strong> : la config (volume) ET l'image qui contient le moteur.",
         "q": "Il faut les deux : la config (volume) ET l'image qui contient le moteur."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "<code>cannot create a unique index without the column \"ts\"</code>.",
       "q": "cannot create a unique index without the column \"ts\".",
       "body": "Timescale exige que la colonne de découpage fasse partie de la clé primaire.",
       "bodyq": "Timescale exige que la colonne de découpage fasse partie de la clé primaire.",
       "fixes": [
        {
         "kind": "fix",
         "html": "<code>PRIMARY KEY (id, ts)</code>. Sur une table existante : <code>ALTER TABLE ... DROP CONSTRAINT</code> puis <code>ADD PRIMARY KEY</code>, sans vider la table.",
         "q": "PRIMARY KEY (id, ts). Sur une table existante : ALTER TABLE ... DROP CONSTRAINT puis ADD PRIMARY KEY, sans vider la table."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "<code>CREATE MATERIALIZED VIEW ... cannot run inside a transaction block</code>.",
       "q": "CREATE MATERIALIZED VIEW ... cannot run inside a transaction block.",
       "body": "Le <code>with psycopg.connect()</code> ouvre une transaction ; l'agrégat continu refuse d'y être.",
       "bodyq": "Le with psycopg.connect() ouvre une transaction ; l'agrégat continu refuse d'y être.",
       "fixes": [
        {
         "kind": "fix",
         "html": "<code>psycopg.connect(..., autocommit=True)</code>.",
         "q": "psycopg.connect(..., autocommit=True)."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "Le schéma marchait au terminal mais pas en relançant <code>schema.py</code>.",
       "q": "Le schéma marchait au terminal mais pas en relançant schema.py.",
       "body": "Des commandes tapées à la main (hypertable, agrégat, rétention, colonne <code>received_at</code>) n'avaient jamais été ajoutées au fichier.",
       "bodyq": "Des commandes tapées à la main (hypertable, agrégat, rétention, colonne received_at) n'avaient jamais été ajoutées au fichier.",
       "fixes": [
        {
         "kind": "fix",
         "html": "La structure de la base doit vivre <strong>dans le code</strong>, pas dans l'historique du terminal.",
         "q": "La structure de la base doit vivre dans le code, pas dans l'historique du terminal."
        }
       ],
       "points": []
      }
     ]
    },
    {
     "id": "grafana",
     "title": "Grafana",
     "short": "Grafana",
     "q": "Grafana",
     "group": 2,
     "blocks": [
      {
       "type": "entry",
       "title": "Une seule ligne verticale au lieu d'une courbe.",
       "q": "Une seule ligne verticale au lieu d'une courbe.",
       "body": "Toutes les mesures avaient le même timestamp (<code>seed.py</code> insérait tout avec <code>now()</code>).",
       "bodyq": "Toutes les mesures avaient le même timestamp (seed.py insérait tout avec now()).",
       "fixes": [
        {
         "kind": "fix",
         "html": "Vérifier avec <code>GROUP BY sensor_id</code> + <code>MIN(ts)</code>, <code>MAX(ts)</code> : si min = max, les données ne sont pas étalées dans le temps.",
         "q": "Vérifier avec GROUP BY sensor_id + MIN(ts), MAX(ts) : si min = max, les données ne sont pas étalées dans le temps."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "404 « File not found » sur une URL de l'API.",
       "q": "404 « File not found » sur une URL de l'API.",
       "body": "Format d'erreur d'un autre serveur — FastAPI aurait renvoyé du JSON. Uvicorn ne tournait pas, ou un autre programme occupait le port.",
       "bodyq": "Format d'erreur d'un autre serveur — FastAPI aurait renvoyé du JSON. Uvicorn ne tournait pas, ou un autre programme occupait le port.",
       "fixes": [
        {
         "kind": "fix",
         "html": "Lire la <strong>forme</strong> du message d'erreur pour savoir qui répond.",
         "q": "Lire la forme du message d'erreur pour savoir qui répond."
        }
       ],
       "points": []
      }
     ]
    },
    {
     "id": "docker",
     "title": "Docker",
     "short": "Docker",
     "q": "Docker",
     "group": 3,
     "blocks": [
      {
       "type": "entry",
       "title": "<code>pip install</code> échoue au build.",
       "q": "pip install échoue au build.",
       "body": "Le <code>requirements.txt</code> généré par <code>pip freeze</code> contenait <code>-e /Users/voligle/workspace/IOT</code> — un chemin absolu local, inexistant dans l'image.",
       "bodyq": "Le requirements.txt généré par pip freeze contenait -e /Users/voligle/workspace/IOT — un chemin absolu local, inexistant dans l'image.",
       "fixes": [
        {
         "kind": "fix",
         "html": "Retirer l'install editable du requirements destiné à Docker ; <code>ENV PYTHONPATH=/app/src</code> fait le même travail.",
         "q": "Retirer l'install editable du requirements destiné à Docker ; ENV PYTHONPATH=/app/src fait le même travail."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "Docker Desktop complètement figé, <code>docker ps</code> ne répond plus.",
       "q": "Docker Desktop complètement figé, docker ps ne répond plus.",
       "body": "",
       "bodyq": "",
       "fixes": [
        {
         "kind": "fix",
         "html": "<code>sudo pkill -9 -f Docker</code>, ou redémarrer le Mac. Le volume survit, aucune donnée perdue.",
         "q": "sudo pkill -9 -f Docker, ou redémarrer le Mac. Le volume survit, aucune donnée perdue."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "Aucun log Python dans le conteneur, alors que le service fonctionne (alertes Telegram reçues).",
       "q": "Aucun log Python dans le conteneur, alors que le service fonctionne (alertes Telegram reçues).",
       "body": "Python bufferise sa sortie quand elle n'est pas connectée à un terminal : les <code>print()</code> s'accumulent au lieu de s'afficher.",
       "bodyq": "Python bufferise sa sortie quand elle n'est pas connectée à un terminal : les print() s'accumulent au lieu de s'afficher.",
       "fixes": [
        {
         "kind": "fix",
         "html": "<code>ENV PYTHONUNBUFFERED=1</code> dans le Dockerfile. Réflexe standard pour tout Python conteneurisé.",
         "q": "ENV PYTHONUNBUFFERED=1 dans le Dockerfile. Réflexe standard pour tout Python conteneurisé."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "Base vide après le passage à Docker Compose.",
       "q": "Base vide après le passage à Docker Compose.",
       "body": "Compose crée ses propres volumes préfixés par le nom du projet (<code>iot_pgdata</code> ≠ <code>pgdata</code>).",
       "bodyq": "Compose crée ses propres volumes préfixés par le nom du projet (iot_pgdata ≠ pgdata).",
       "fixes": [
        {
         "kind": "fix",
         "html": "Soit repartir propre, soit déclarer le volume <code>external: true</code> pour réutiliser l'existant.",
         "q": "Soit repartir propre, soit déclarer le volume external: true pour réutiliser l'existant."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "<code>ModuleNotFoundError: No module named 'alertes'</code> dans le conteneur, alors que ça marchait en local.",
       "q": "ModuleNotFoundError: No module named 'alertes' dans le conteneur, alors que ça marchait en local.",
       "body": "<code>from alertes import ...</code> fonctionnait en local parce que le fichier était lancé <strong>depuis son dossier</strong>. Dans le conteneur, on lance depuis <code>/app</code> avec <code>PYTHONPATH=/app/src</code> <i class=\"ar\">→</i> l'import simple casse.",
       "bodyq": "from alertes import ... fonctionnait en local parce que le fichier était lancé depuis son dossier. Dans le conteneur, on lance depuis /app avec PYTHONPATH=/app/src → l'import simple casse.",
       "fixes": [
        {
         "kind": "fix",
         "html": "Import absolu depuis la racine du paquet : <code>from iot.alertes.alertes import envoyer_alerte</code>.",
         "q": "Import absolu depuis la racine du paquet : from iot.alertes.alertes import envoyer_alerte."
        },
        {
         "kind": "lesson",
         "html": "conteneuriser révèle les dépendances implicites au dossier de lancement. Le code avait déjà cette fragilité, Docker l'a exposée.",
         "q": "conteneuriser révèle les dépendances implicites au dossier de lancement. Le code avait déjà cette fragilité, Docker l'a exposée."
        }
       ],
       "points": []
      }
     ]
    },
    {
     "id": "deploiement-aws",
     "title": "Déploiement AWS",
     "short": "Déploiement AWS",
     "q": "Déploiement AWS",
     "group": 4,
     "blocks": [
      {
       "type": "entry",
       "title": "<code>Connection refused</code> du receiver vers la base, au premier démarrage.",
       "q": "Connection refused du receiver vers la base, au premier démarrage.",
       "body": "<code>depends_on</code> garantit l'<strong>ordre de démarrage</strong>, pas la <strong>disponibilité</strong>. Timescale met 10–30 s à s'initialiser (il se configure, redémarre, puis accepte les connexions).",
       "bodyq": "depends_on garantit l'ordre de démarrage, pas la disponibilité. Timescale met 10–30 s à s'initialiser (il se configure, redémarre, puis accepte les connexions).",
       "fixes": [
        {
         "kind": "fix",
         "html": "Vraies solutions : <code>healthcheck</code> + <code>depends_on: condition: service_healthy</code>, ou reconnexion dans le code. <code>restart: unless-stopped</code> est le rattrapage brutal.",
         "q": "Vraies solutions : healthcheck + depends_on: condition: service_healthy, ou reconnexion dans le code. restart: unless-stopped est le rattrapage brutal."
        },
        {
         "kind": "fix",
         "html": "Attention : <code>logs --tail 5</code> peut montrer des erreurs <strong>anciennes</strong>. Vérifier le STATUS dans <code>docker compose ps</code> et utiliser <code>--timestamps</code>.",
         "q": "Attention : logs --tail 5 peut montrer des erreurs anciennes. Vérifier le STATUS dans docker compose ps et utiliser --timestamps."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "<code>Your local changes would be overwritten by merge</code> au <code>git pull</code>.",
       "q": "Your local changes would be overwritten by merge au git pull.",
       "body": "Le fichier avait été édité <strong>sur le serveur</strong> avec nano, et aussi sur le Mac.",
       "bodyq": "Le fichier avait été édité sur le serveur avec nano, et aussi sur le Mac.",
       "fixes": [
        {
         "kind": "fix",
         "html": "<code>git checkout -- &lt;fichier&gt;</code> puis <code>git pull</code>.",
         "q": "git checkout -- <fichier> puis git pull."
        },
        {
         "kind": "fix",
         "html": "<strong>Règle</strong> : le serveur ne fait que <code>git pull</code> + <code>docker compose up</code>. On n'édite jamais le code sur le serveur. Seule exception : le <code>.env</code>, qui n'est jamais dans git.",
         "q": "Règle : le serveur ne fait que git pull + docker compose up. On n'édite jamais le code sur le serveur. Seule exception : le .env, qui n'est jamais dans git."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "<code>git ls-files</code> révèle <code>mosquitto/config/passwd</code> — un fichier de secrets suivi par git.",
       "q": "git ls-files révèle mosquitto/config/passwd — un fichier de secrets suivi par git.",
       "body": "Le fichier de mots de passe (même hachés) était versionné, donc sur GitHub.",
       "bodyq": "Le fichier de mots de passe (même hachés) était versionné, donc sur GitHub.",
       "fixes": [
        {
         "kind": "fix",
         "html": "<code>.gitignore</code> + <code>git rm --cached mosquitto/config/passwd</code> (garde le fichier sur disque, arrête de le suivre). Reste dans l'historique — acceptable ici (hachés), sinon <code>git filter-repo</code>.",
         "q": ".gitignore + git rm --cached mosquitto/config/passwd (garde le fichier sur disque, arrête de le suivre). Reste dans l'historique — acceptable ici (hachés), sinon git filter-repo."
        },
        {
         "kind": "lesson",
         "html": "<code>passwd</code> est un secret au même titre que <code>.env</code> — jamais dans git, recréé dans chaque environnement avec <code>mosquitto_passwd</code>.",
         "q": "passwd est un secret au même titre que .env — jamais dans git, recréé dans chaque environnement avec mosquitto_passwd."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "Après un stop/start d'instance EC2, impossible de se connecter en SSH.",
       "q": "Après un stop/start d'instance EC2, impossible de se connecter en SSH.",
       "body": "L'IP publique EC2 est <strong>éphémère</strong> : elle change à chaque arrêt/redémarrage.",
       "bodyq": "L'IP publique EC2 est éphémère : elle change à chaque arrêt/redémarrage.",
       "fixes": [
        {
         "kind": "fix",
         "html": "Récupérer la nouvelle IP dans la console. Pour une adresse stable : <strong>Elastic IP</strong> (fixe, gratuite tant qu'attachée à une instance active — une Elastic IP non attachée est facturée).",
         "q": "Récupérer la nouvelle IP dans la console. Pour une adresse stable : Elastic IP (fixe, gratuite tant qu'attachée à une instance active — une Elastic IP non attachée est facturée)."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "Après redémarrage de l'instance EC2, aucun conteneur ne remonte malgré <code>restart: unless-stopped</code>.",
       "q": "Après redémarrage de l'instance EC2, aucun conteneur ne remonte malgré restart: unless-stopped.",
       "body": "<code>unless-stopped</code> = redémarre SAUF si arrêté explicitement. Les conteneurs stoppés à la main (ou à l'arrêt de l'instance) ne reviennent pas.",
       "bodyq": "unless-stopped = redémarre SAUF si arrêté explicitement. Les conteneurs stoppés à la main (ou à l'arrêt de l'instance) ne reviennent pas.",
       "fixes": [
        {
         "kind": "fix",
         "html": "<code>docker compose up -d</code> pour relancer. Pour un retour <strong>automatique</strong> après reboot : <code>restart: always</code>, ou un service systemd qui lance <code>docker compose up</code> au démarrage.",
         "q": "docker compose up -d pour relancer. Pour un retour automatique après reboot : restart: always, ou un service systemd qui lance docker compose up au démarrage."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "Un service (mosquitto) absent de <code>docker compose ps</code> alors qu'il est bien dans le <code>docker-compose.yml</code>.",
       "q": "Un service (mosquitto) absent de docker compose ps alors qu'il est bien dans le docker-compose.yml.",
       "body": "Compose tournait sur une <strong>définition en cache</strong>, pas sur le fichier à jour (après plusieurs redémarrages/modifications).",
       "bodyq": "Compose tournait sur une définition en cache, pas sur le fichier à jour (après plusieurs redémarrages/modifications).",
       "fixes": [
        {
         "kind": "fix",
         "html": "<code>docker compose down &amp;&amp; docker compose up -d</code> force la relecture complète du fichier. Plus fiable qu'un simple <code>up</code> après des changements.",
         "q": "docker compose down && docker compose up -d force la relecture complète du fichier. Plus fiable qu'un simple up après des changements."
        }
       ],
       "points": []
      },
      {
       "type": "entry",
       "title": "Mosquitto : <code>Unable to open pwfile</code> alors que le fichier <code>passwd</code> existe.",
       "q": "Mosquitto : Unable to open pwfile alors que le fichier passwd existe.",
       "body": "Le fichier appartenait à <code>root</code> avec permissions <code>-rw-------</code>, mais Mosquitto tourne en tant qu'utilisateur <code>mosquitto</code> dans le conteneur <i class=\"ar\">→</i> pas le droit de le lire.",
       "bodyq": "Le fichier appartenait à root avec permissions -rw-------, mais Mosquitto tourne en tant qu'utilisateur mosquitto dans le conteneur → pas le droit de le lire.",
       "fixes": [
        {
         "kind": "fix",
         "html": "<code>sudo chmod 644 mosquitto/config/passwd</code> (lisible par tous ; sans risque car mots de passe hachés).",
         "q": "sudo chmod 644 mosquitto/config/passwd (lisible par tous ; sans risque car mots de passe hachés)."
        },
        {
         "kind": "lesson",
         "html": "un fichier créé par un conteneur root peut être illisible par le process qui en a besoin. Vérifier propriétaire ET permissions, pas seulement l'existence.",
         "q": "un fichier créé par un conteneur root peut être illisible par le process qui en a besoin. Vérifier propriétaire ET permissions, pas seulement l'existence."
        }
       ],
       "points": []
      }
     ]
    },
    {
     "id": "reflexes-de-debogage-a-retenir",
     "title": "Réflexes de débogage à retenir",
     "short": "Réflexes de débogage à retenir",
     "q": "Réflexes de débogage à retenir",
     "group": 5,
     "blocks": [
      {
       "type": "steps",
       "items": [
        {
         "html": "<strong>Isoler</strong> avant de corriger : quel maillon casse ? (<code>mosquitto_sub</code> pour MQTT, <code>docker compose ps</code> pour les services)",
         "q": "Isoler avant de corriger : quel maillon casse ? (mosquitto_sub pour MQTT, docker compose ps pour les services)"
        },
        {
         "html": "<strong>Lire le message exact</strong> : chemin, nom de fichier, port. L'erreur dit souvent précisément ce qui manque.",
         "q": "Lire le message exact : chemin, nom de fichier, port. L'erreur dit souvent précisément ce qui manque."
        },
        {
         "html": "<strong>Vérifier l'état réel</strong> plutôt que supposer (<code>docker ps</code>, <code>timescaledb_information.jobs</code>, <code>MIN/MAX(ts)</code>).",
         "q": "Vérifier l'état réel plutôt que supposer (docker ps, timescaledb_information.jobs, MIN/MAX(ts))."
        },
        {
         "html": "<strong>Attention aux logs anciens</strong> : un service peut être <code>Up</code> avec des erreurs datées du démarrage.",
         "q": "Attention aux logs anciens : un service peut être Up avec des erreurs datées du démarrage."
        },
        {
         "html": "<strong>Un conteneur ne connaît que son propre monde</strong> : chemins absolus locaux, <code>localhost</code>, ports non exposés — autant de pièges.",
         "q": "Un conteneur ne connaît que son propre monde : chemins absolus locaux, localhost, ports non exposés — autant de pièges."
        }
       ]
      }
     ]
    }
   ],
   "source": "docs/DEBUG.md"
  },
  {
   "id": "frictions",
   "label": "Frictions",
   "kicker": "Les douleurs",
   "verb": "Reflechir",
   "title": "Frictions &amp; idées produit",
   "titleq": "Frictions & idées produit",
   "lead": "Douleurs réelles rencontrées en construisant le projet. À relire après le tracker et la prépa entretien — pas avant. Les frictions qui reviennent plusieurs fois sont les vraies pistes.",
   "intro": [
    {
     "type": "p",
     "html": "Douleurs réelles rencontrées en construisant le projet. À relire <strong>après</strong> le tracker et la prépa entretien — pas avant. Les frictions qui reviennent plusieurs fois sont les vraies pistes.",
     "q": "Douleurs réelles rencontrées en construisant le projet. À relire après le tracker et la prépa entretien — pas avant. Les frictions qui reviennent plusieurs fois sont les vraies pistes."
    },
    {
     "type": "p",
     "html": "Règle : noter la <strong>douleur</strong>, pas l'idée. L'idée vient après, quand on a vécu le problème plusieurs fois.",
     "q": "Règle : noter la douleur, pas l'idée. L'idée vient après, quand on a vécu le problème plusieurs fois."
    }
   ],
   "sections": [
    {
     "id": "idees-notees-a-ne-pas-poursuivre-maintenant",
     "title": "Idées notées (à ne pas poursuivre maintenant)",
     "short": "Idées notées",
     "q": "Idées notées (à ne pas poursuivre maintenant)",
     "group": 0,
     "blocks": [
      {
       "type": "entry",
       "title": "« Lovable / Databricks pour l'IoT »",
       "q": "« Lovable / Databricks pour l'IoT »",
       "body": "Connecter sa solution IoT existante (AWS, Azure, sa propre stack), la comprendre automatiquement, la superviser.",
       "bodyq": "Connecter sa solution IoT existante (AWS, Azure, sa propre stack), la comprendre automatiquement, la superviser.",
       "fixes": [],
       "points": [
        {
         "term": "Reformulation honnête",
         "def": "<em>configurer une bonne supervision IoT demande trop d'expertise ; pourquoi dois-je savoir quoi afficher au lieu que le système le déduise de mes données ?</em>",
         "q": "Reformulation honnête : configurer une bonne supervision IoT demande trop d'expertise ; pourquoi dois-je savoir quoi afficher au lieu que le système le déduise de mes données ?"
        },
        {
         "term": "Réserve",
         "def": "marché occupé côté appareil (Golioth, Memfault, balena) et côté analytics (Tulip, Litmus, HighByte, Seeq, AWS SiteWise). Le vrai produit dur = « comprendre automatiquement le schéma arbitraire d'un client », pas la visualisation.",
         "q": "Réserve : marché occupé côté appareil (Golioth, Memfault, balena) et côté analytics (Tulip, Litmus, HighByte, Seeq, AWS SiteWise). Le vrai produit dur = « comprendre automatiquement le schéma arbitraire d'un client », pas la visualisation."
        }
       ]
      },
      {
       "type": "entry",
       "title": "Dashboards IoT meilleurs que Grafana",
       "q": "Dashboards IoT meilleurs que Grafana",
       "body": "Grafana est austère, configurer un bon dashboard est pénible.",
       "bodyq": "Grafana est austère, configurer un bon dashboard est pénible.",
       "fixes": [],
       "points": [
        {
         "term": "Réserve",
         "def": "« plus joli » ne fait pas payer une entreprise. Ce qui fait payer = « je n'arrivais pas à faire X, maintenant je peux ».",
         "q": "Réserve : « plus joli » ne fait pas payer une entreprise. Ce qui fait payer = « je n'arrivais pas à faire X, maintenant je peux »."
        }
       ]
      },
      {
       "type": "entry",
       "title": "Automatiser le passage dev <i class=\"ar\">→</i> production en IoT",
       "q": "Automatiser le passage dev → production en IoT",
       "body": "Un agent qui déploie n'importe quelle stack IoT sur n'importe quel cloud, et teste seul.",
       "bodyq": "Un agent qui déploie n'importe quelle stack IoT sur n'importe quel cloud, et teste seul.",
       "fixes": [],
       "points": [
        {
         "term": "Observation juste",
         "def": "l'IoT est moins bien servi que le web (Heroku/Render/Vercel visent le web, pas un broker MQTT + base temporelle + appareils hors ligne).",
         "q": "Observation juste : l'IoT est moins bien servi que le web (Heroku/Render/Vercel visent le web, pas un broker MQTT + base temporelle + appareils hors ligne)."
        },
        {
         "term": "Distinction à trancher AVANT d'y croire",
         "def": "« agent qui déploie sur tout cloud » = produit <strong>DevOps</strong> (marché saturé). Ce qui serait spécifique IoT = flotte, OTA, appareils hors ligne (déjà servi par Golioth/Memfault/balena). L'idée est pile entre les deux — la ligne doit être tranchée.",
         "q": "Distinction à trancher AVANT d'y croire : « agent qui déploie sur tout cloud » = produit DevOps (marché saturé). Ce qui serait spécifique IoT = flotte, OTA, appareils hors ligne (déjà servi par Golioth/Memfault/balena). L'idée est pile entre les deux — la ligne doit être tranchée."
        }
       ]
      }
     ]
    },
    {
     "id": "frictions-techniques-vecues-matiere-premiere",
     "title": "Frictions techniques vécues (matière première)",
     "short": "Frictions techniques vécues",
     "q": "Frictions techniques vécues (matière première)",
     "group": 1,
     "blocks": [
      {
       "type": "list",
       "items": [
        {
         "term": "Détection de capteur silencieux",
         "def": "dû la coder à la main. Pourquoi ce n'est pas un standard prêt à l'emploi ?",
         "q": "Détection de capteur silencieux dû la coder à la main. Pourquoi ce n'est pas un standard prêt à l'emploi ?"
        },
        {
         "term": "Secrets / config",
         "def": "encore très artisanal (recréer <code>.env</code> et <code>passwd</code> à la main dans chaque environnement).",
         "q": "Secrets / config encore très artisanal (recréer .env et passwd à la main dans chaque environnement)."
        },
        {
         "term": "Horodatage IoT",
         "def": "fondamentalement peu fiable côté appareil, pas de solution propre standard. Trois instants différents (mesure / publication / réception) et on ne contrôle pas l'horloge de l'appareil.",
         "q": "Horodatage IoT fondamentalement peu fiable côté appareil, pas de solution propre standard. Trois instants différents (mesure / publication / réception) et on ne contrôle pas l'horloge de l'appareil."
        },
        {
         "term": "dev <i class=\"ar\">→</i> prod",
         "def": "une cascade de frictions même avec tous les conteneurs prêts — <code>localhost</code> vs nom de service, imports relatifs fragiles, <code>depends_on</code> ≠ disponibilité, logs Python bufferisés, secrets hors git à recréer, permissions de fichiers créés par conteneurs root, IP EC2 éphémère, cache Compose. Chacune est un problème de <strong>compréhension</strong>, pas seulement d'outillage.",
         "q": "dev → prod une cascade de frictions même avec tous les conteneurs prêts — localhost vs nom de service, imports relatifs fragiles, depends_on ≠ disponibilité, logs Python bufferisés, secrets hors git à recréer, permissions de fichiers créés par conteneurs root, IP EC2 éphémère, cache Compose. Chacune est un problème de compréhension, pas seulement d'outillage."
        }
       ]
      }
     ]
    },
    {
     "id": "note-personnelle",
     "title": "Note personnelle",
     "short": "Note personnelle",
     "q": "Note personnelle",
     "group": 2,
     "blocks": [
      {
       "type": "p",
       "html": "Motif récurrent observé : une nouvelle idée de produit surgit <strong>à chaque fin de phase difficile</strong> (trading <i class=\"ar\">→</i> JYM <i class=\"ar\">→</i> ces trois idées en trois jours). Ce n'est pas un hasard — c'est ce que fait le cerveau quand une chose est finie et que la suivante paraît lourde.",
       "q": "Motif récurrent observé : une nouvelle idée de produit surgit à chaque fin de phase difficile (trading → JYM → ces trois idées en trois jours). Ce n'est pas un hasard — c'est ce que fait le cerveau quand une chose est finie et que la suivante paraît lourde."
      },
      {
       "type": "p",
       "html": "Le corrECTif n'est pas d'ignorer les idées, mais de les <strong>noter ici et revenir à l'action en cours</strong>. Finir ce qui est commencé d'abord. Le tracker a prouvé que finir est possible.",
       "q": "Le corrECTif n'est pas d'ignorer les idées, mais de les noter ici et revenir à l'action en cours. Finir ce qui est commencé d'abord. Le tracker a prouvé que finir est possible."
      }
     ]
    }
   ],
   "source": "docs/FRICTIONS.md"
  }
 ]
};
