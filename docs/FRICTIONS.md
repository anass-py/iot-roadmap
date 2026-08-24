# Frictions & idées produit

Douleurs réelles rencontrées en construisant le projet. À relire **après** le tracker et la prépa entretien — pas avant. Les frictions qui reviennent plusieurs fois sont les vraies pistes.

Règle : noter la **douleur**, pas l'idée. L'idée vient après, quand on a vécu le problème plusieurs fois.

---

## Idées notées (à ne pas poursuivre maintenant)

**« Lovable / Databricks pour l'IoT »**
Connecter sa solution IoT existante (AWS, Azure, sa propre stack), la comprendre automatiquement, la superviser.
- Reformulation honnête : *configurer une bonne supervision IoT demande trop d'expertise ; pourquoi dois-je savoir quoi afficher au lieu que le système le déduise de mes données ?*
- Réserve : marché occupé côté appareil (Golioth, Memfault, balena) et côté analytics (Tulip, Litmus, HighByte, Seeq, AWS SiteWise). Le vrai produit dur = « comprendre automatiquement le schéma arbitraire d'un client », pas la visualisation.

**Dashboards IoT meilleurs que Grafana**
Grafana est austère, configurer un bon dashboard est pénible.
- Réserve : « plus joli » ne fait pas payer une entreprise. Ce qui fait payer = « je n'arrivais pas à faire X, maintenant je peux ».

**Automatiser le passage dev → production en IoT**
Un agent qui déploie n'importe quelle stack IoT sur n'importe quel cloud, et teste seul.
- Observation juste : l'IoT est moins bien servi que le web (Heroku/Render/Vercel visent le web, pas un broker MQTT + base temporelle + appareils hors ligne).
- Distinction à trancher AVANT d'y croire : « agent qui déploie sur tout cloud » = produit **DevOps** (marché saturé). Ce qui serait spécifique IoT = flotte, OTA, appareils hors ligne (déjà servi par Golioth/Memfault/balena). L'idée est pile entre les deux — la ligne doit être tranchée.

---

## Frictions techniques vécues (matière première)

- **Détection de capteur silencieux** : dû la coder à la main. Pourquoi ce n'est pas un standard prêt à l'emploi ?
- **Secrets / config** : encore très artisanal (recréer `.env` et `passwd` à la main dans chaque environnement).
- **Horodatage IoT** : fondamentalement peu fiable côté appareil, pas de solution propre standard. Trois instants différents (mesure / publication / réception) et on ne contrôle pas l'horloge de l'appareil.
- **dev → prod** : une cascade de frictions même avec tous les conteneurs prêts — `localhost` vs nom de service, imports relatifs fragiles, `depends_on` ≠ disponibilité, logs Python bufferisés, secrets hors git à recréer, permissions de fichiers créés par conteneurs root, IP EC2 éphémère, cache Compose. Chacune est un problème de **compréhension**, pas seulement d'outillage.

---

## Note personnelle

Motif récurrent observé : une nouvelle idée de produit surgit **à chaque fin de phase difficile** (trading → JYM → ces trois idées en trois jours). Ce n'est pas un hasard — c'est ce que fait le cerveau quand une chose est finie et que la suivante paraît lourde. 

Le corrECTif n'est pas d'ignorer les idées, mais de les **noter ici et revenir à l'action en cours**. Finir ce qui est commencé d'abord. Le tracker a prouvé que finir est possible.
