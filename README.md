OPENCLASSROOMS PROJECT 7 GROUPOMANIA - WEB DEVELOPPER

Backend
Technos utilisées : Node.js / Express.js / MySQL (service de base de données)
Packages utilisés : voir backend/packages.json
installation
Dans le repertoire backend via un invite de commande.
Exécuter la commande npm install afin d'installer les dépendances de l'API.
Ouvrir le fichier (backend/).env et entrez le host, les identifiants (admin) et le nom de la base de données que l’on souhaite créer. Exemple : SQL_BDD_HOST = localhost SQL_BDD_USER = root SQL_BDD_PASSWORD = root SQL_BDD_NAME = groupomania
Dans ce même fichier (backend/).env, entrer une clé secrète qui sera utilisée pour encoder et décoder les tokens d'authenfications, entrer aussi une durée en heure avant l'expiration des tokens d'authentifications. Exemple : JWT_AUTH_SECRET_TOKEN=56E4RH54ER654HEYERLKKJKGKGPME JWT_EXPIRATION=24h
Exécuter la commande node bdd_config/bdd_config.js pour configurer et créer la base de données. 
lancement du serveur
Exécuter la commande nodemon server pour lancer le serveur de développement.

Frontend
Technos utilisées : Vue.js
Packages utilisés : voir frontend/packages.json
installation
Dans le repertoire frontend via un invite de commande.
Exécuter la commande npm install afin d'installer les dépendances de l'appication.
Ouvrir le fichier (front/).env et entrer EXACTEMENT la même clé secrète renseignée dans notre fichier (backend/).env Exemple : VUE_APP_JWT_AUTH_SECRET_TOKEN=56E4RH54ER654HEYERLKKJKGKGPME 
lancement du serveur
Exécuter la commande npm run serve pour lancer le serveur de développement.

Modération
Chaque utilisateur est créé avec le niveau d'accès 0 (utilisateur).
La valeur de niveau_acces doit être passée a 1 (modérateur).
Une reconnexion est nécéssaire pour mettre a jour la session utilisateur avec le nouveau niveau d'acces.
