sender doit se connecté au broker (public ou localhost via conteneur)
receiver doit écouter le broker et afficher les messages. ssg doit etre au bon format avec le sender.
ajouter fastapi sur le sender, mais enlève loop.forever(), problème de 2 threads qui doivent coexister en mm temps sur le mm processus, donc met loop.start (deamon=true) pour que les 2 threads arrete avec ctrl-C.
messages effacé apres ctrl-c, pour cela on ajout base de donnée.
--------------
------DB------
--------------
on crée les tables, ordre de création important par dépendance.
on crée la big-mama, puis on crée ceux qui dependent d'elle.
si on supprime, on supprime par inverse, on ne supprime pas une table dont une autre dépends encore.
----JOIN----
tu joins deux tables avec la colonne qui les relies
join : tu joins en intersection, les deux tables doivent avoir une valeur
left join : tu prends tous ce qui est a gauche mm s'il na pas de valeur (unions) table de gauche est celle que t'a choisis dans FROM.
------- group by -----
tu regroupe par paquet(toi de choisir le param) pour faire la somme, moyenne ...
----partition----
Le schéma mental : PARTITION BY découpe en groupes, ORDER BY trie dans chaque groupe, LAG recule d'une ligne sans sortir du groupe.
sump up : Fonction fenêtre = calcul par ligne sans écraser. PARTITION BY = paquets. LAG = ligne précédente.
--migrationtimescaledb----migrer une table posgresql pleine: 
1-changer l'image(volume gardé)
2-alter table pour pour mettre la clé sur ts
3-create_hypertable(migrate_data => true), pour transformer ta table en timescale
---------- timescaledb/moyenne-------
je crée une vue matérialisé continue qui calcul la moyenne en background chaque fois qu"une valeur d'ajoute sur reading.
----batch-----
executemany au lieu de execute, insère par lot, donc réduit le temps.

----API -----
couche entre db et clients/application.
expose data without exposing db.
pagination : give user to get more than a limit by tranches (offset or cursor)

----------aggregation -------
pre-aggregation : do some work on databse, to let your backend breath.
-the aggregat continue that we made on the database to compute la moyenne des valeurs is something useful if we don't need it real time, because it is updated by itself, and you can have control over this : 
SELECT add_continuous_aggregate_policy('readings_hourly',
    start_offset => INTERVAL '3 hours',
    end_offset   => INTERVAL '1 hour',
    schedule_interval => INTERVAL '30 minutes');
look for :
SELECT job_id, proc_name, schedule_interval 
FROM timescaledb_information.jobs;

--------------------------------
don't forget the 401, 404 ...
--------- graphana --------------
capteur silencieux = dernière mesure trop vieille. now() - MAX(ts) > seuil. Seuil = quelques fois la période d'émission.

--------alertes---------
connect to db, detect the ones that haven't send over a period of time, send the alerts to telegram bot.

------file d'attete MQTT ----
latency between sending and receiving:
clean_start=False coté receiver, dit au broker, send me all data when i was off, since now i m on motherfucker.
-----------------
autocommit= true : we commit each line by line, because the imescaledb execustion wants to be commited at the moment of creation.
-------------------
compose vs run : 
-so between db and mosquito, they can talk to each other bcs they are on the same compose.
-if i add a separate container for receive, i need to manually add network to talk to the compose (db and mosquito)
-if i create a container for receive inside compose, they can talk with names.
all in all, if something run on my machine, it can talk to any container (run, or compose) simply with localhost via ports, if isolated containers, we need network manually, that's why if many containers we need compose.
-----------------------------
 builder vs slim :
 if we have some gcc heavy compilation, we :
 1- create a builder image from requirement.txt.
 2- create a slim image that copy only results from the builder.
 once the dependencie change during your project, update only requirements.txt, and re-build the slim image. on the background docker knew what he should do.
 -----------------------------
 