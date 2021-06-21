const mysql = require('mysql2');       // IMPORTATION MYSQL

const bdd = mysql.createPool({                // CREATION CONNEXION         
    connectionLimit: 30,                      // LIMITE DE 30 CONNEXION
  host     : process.env.SQL_BDD_HOST,
  user     : process.env.SQL_BDD_USER,
  password : process.env.SQL_BDD_PASSWORD,
  database : process.env.SQL_BDD_NAME,
  port     : process.env.SQL_BDD_PORT
});

bdd.query('SELECT 1 + 1 AS solution', function (error, results, fields) {     // TEST CONNECXION BDD
  if (error) {
    return console.error('error: ' + error.message);                          
  }
  console.log("Connexion à la base de données MySQL validée !");             
});

module.exports = bdd;