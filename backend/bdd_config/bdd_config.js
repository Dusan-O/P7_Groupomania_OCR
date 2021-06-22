require('dotenv').config();      
const mysql2 = require('mysql2'); 

// PARAMETRES DE CONNEXION AU SERVEUR MYSQL 
//const mysqlConnexion = mysql2.createConnection({
//host     : process.env.SQL_BDD_HOST,
//user     : process.env.SQL_BDD_USER,
//password : process.env.SQL_BDD_PASSWORD
//});

// PARAMETRES DE CONNEXION AU SERVEUR MYSQL 
const bdd = mysql2.createConnection({
  host     : process.env.SQL_BDD_HOST,
  user     : process.env.SQL_BDD_USER,
  password : process.env.SQL_BDD_PASSWORD,
  // database : process.env.SQL_BDD_NAME,
  port     : process.env.SQL_BDD_PORT
});
console.log(process.env.SQL_BDD_HOST);
console.log(process.env.SQL_BDD_USER);
console.log(process.env.SQL_BDD_PASSWORD);
console.log(process.env.SQL_BDD_NAME);
// DATABASE
var database = `CREATE DATABASE ${process.env.SQL_BDD_NAME};`
var useDatabase = `USE ${process.env.SQL_BDD_NAME};`

// USER TABLE
const tableUsers = "CREATE TABLE `users` ( `id` int PRIMARY KEY AUTO_INCREMENT, `creation_date` TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP), `nom` varchar(30) DEFAULT NULL, `prenom` varchar(30) DEFAULT NULL, `email` varchar(60) NOT NULL UNIQUE, `departement` varchar(30) DEFAULT NULL, `poste` varchar(30) DEFAULT NULL, `mot_de_passe` varchar(100) NOT NULL, `niveau_acces` int DEFAULT NULL ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=1;";
// TABLE POST
const tablePublications = "CREATE TABLE `publications` ( `id` int AUTO_INCREMENT, `user_id` int NOT NULL, `creation_date` TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP), `titre` text NOT NULL, `description` text NOT NULL, `image_url` text DEFAULT NULL, PRIMARY KEY (`id`,`user_id`), CONSTRAINT `fk_publication_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=1;"
// TABLE COMMENTS
const tableCommentaires= "CREATE TABLE `commentaires` ( `id` int AUTO_INCREMENT, `user_id` int NOT NULL, `publication_id` int NOT NULL, `creation_date` TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP), `message` text NOT NULL, PRIMARY KEY (`id`, `user_id`, `publication_id`), CONSTRAINT `fk_commentaire_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE, CONSTRAINT `fk_commentaire_publication_id` FOREIGN KEY (`publication_id`) REFERENCES `publications` (`id`) ON DELETE CASCADE ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=1;"
// TABLE VOTES
const tableVotes = "CREATE TABLE `votes` ( `id` int AUTO_INCREMENT, `user_id` int NOT NULL, `publication_id` int NOT NULL, `vote` int DEFAULT NULL, PRIMARY KEY (`id`, `user_id`, `publication_id`), CONSTRAINT `fk_vote_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE, CONSTRAINT `fk_vote_publication_id` FOREIGN KEY (`publication_id`) REFERENCES `publications` (`id`) ON DELETE CASCADE ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=1;"

// CREATE FUNCTION TO SEQUENCE DIFFERENT TABLES CREATION
const queryCustom = function (query) {
  return new Promise((resolve, reject) => {
    try {
      bdd.query(query, function (err, results, fields) {
        if (err) {
          return console.error('error: ' + err.message);
        }
        resolve(true);
      });
    } catch (error) {
        reject(error);
    }
  });
};

// FONCTION CREATION BDD
const bddCreation = function (database) {
  return new Promise((resolve, reject) => {
    try {
      bdd.connect(function (err) {         // CONNEXION A MYSQL 
        if (err) throw err;
          console.log("-");
          console.log("-------------------------  Début de la configuration -------------------------");
          console.log("-");
          console.log("La configuration de la base de données est en cours... Veuillez patienter...");
          console.log("-");
          console.log("Connexion au serveur MySQL validé.");
          console.log("-");
          console.log(database);
          bdd.query(database, function (err, result) {     // CREATION BDD
            console.log(result);
            if (err) {
              return console.error('error: ' + err.message);
            }
            console.log(`La base de données "${process.env.SQL_BDD_NAME}" a été créée avec succès !`);
            console.log("-");
            resolve(true);
          });
    });
    } catch (err) {
      reject(err);
    }
  });
}

// INITIALISATION CONFIGURATION DE LA DBB 
const launchDatabaseConfig = function() {                                   
  
  //  ASYNC FUNCTION TO USE AWAIT
  const asyncFunction = async function() {                                  
    console.log(tableUsers);
    await bddCreation(database);                                                    // AWAIT DBB CREATION
    await queryCustom(useDatabase);

    bdd.connect( async function (err) {                                     // CONNEXION A LA BDD LORSQUE CREE
      if (err) {
        return console.error('error: ' + err.message);
      }
      try {
        await queryCustom(tableUsers);                                      // AWAIT CREATION USER TABLE
        console.log(`La table "users" a été créée avec succès !`);
        console.log("-");

        await queryCustom(tablePublications);                               // AWAIT CREATION POST TABLE
        console.log(`La table "publications" a été créée avec succès !`);
        console.log("-");

      await queryCustom(tableCommentaires);                               // AWAIT CREATION COMMENT TABLE
        console.log(`La table "commentaires" a été créée avec succès !`);
        console.log("-");

        await queryCustom(tableVotes);                                      // AWAIT CREATION VOTES TABLE
        console.log(`La table "votes" a été créée avec succès !`);
        console.log("-");
        console.log("Votre base de données a bien été configurée")
        console.log("-");
        console.log("-------------------------  Fin de la configuration -------------------------");
        console.log("-");
        process.exit();                                                     //  FIN
      } catch (err) {
        console.error('error: ' + err.message);
      }
    });
  };
  asyncFunction();      // ASYNC FONCTION
};
launchDatabaseConfig();  // GLOBAL FONCTION