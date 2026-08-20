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
