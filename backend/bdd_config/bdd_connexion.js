const mysql = require('mysql2');       // IMPORT MYSQL

const bdd = mysql.createPool({                // CREATE CONNEXION POOL TO DATABASE            
    connectionLimit: 30,                      // LIMIT 30 CONNEXION LIMIT
    host     : process.env.SQL_BDD_HOST,
    user     : process.env.SQL_BDD_USER,
    password : process.env.SQL_BDD_PASSWORD,
    database : process.env.SQL_BDD_NAME
});

bdd.query('SELECT 1 + 1 AS solution', function (error, results, fields) {     // TEST CONNECT DATABASE
  if (error) {
    return console.error('error: ' + error.message);                          
  }
  console.log("Connexion à la base de données MySQL validée !");             
});

module.exports = bdd;