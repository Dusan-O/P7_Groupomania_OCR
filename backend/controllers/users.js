require('dotenv').config();                                                         // importation dotenv pour les variables d'environnement
const validator = require("validator");                                             // importation validator
const mysql = require('mysql2');                                                    // importation mysql
const bcrypt = require ('bcrypt');                                                  // importation bcrypt
const jwt = require('jsonwebtoken');   
const cors = require('cors');                                             // importation jwt
const bdd = require("../bdd_config/bdd_connexion.js");                                 // importation de la connexion a la base de données

const auth = require('../middleware/auth');                                         // importation de notre middleware d'authentification
const verifyPassword = require('../middleware/verify-password');                    // importation du middleware
const verifyPasswordUpdate = require('../middleware/verify-password-update');  

let decodeToken = function(req){                                                    // fonction qui décode le token et récupère le UserID et le niveau d'acces
    let token = req.headers.authorization.split(' ')[1];                            // on récupère uniquement le token du header de la requête
    let decodedToken = jwt.verify(token, process.env.JWT_AUTH_SECRET_TOKEN);        // on décode le token avec la fonction verify qui prend le token et la clé secrète
    decodedToken = [decodedToken.userId, decodedToken.niveau_acces];                // on récupère le niveau d'acces du token décodé
    return decodedToken;                                                            // on retourne un tableau avec le UserId et le niveau d'acces
};

/* CREATE 
*********************************************************/
exports.signup = (req, res, next) => {
    const user = req.body
    // email = user.email
    // let emailhash = sha1(email)
    // user.email = emailhash
     bcrypt.hash(user.password, 10) 
    .then((hash) => {
        user.password = hash
        bdd.query(`INSERT INTO users SET ?`, user, (err, results, field) => {
            console.log(results);
            if (err) {
                console.log(err)
                return res.status(400).json("erreur")
            }
            return res.status(201).json({message : 'Votre compte a bien été crée !', token: jwt.sign({ userId: results.insertId, status: 201 },process.env.JWT_AUTH_SECRET_TOKEN,{ expiresIn: '24h' })
        },)
        });
    });
};  

/* LOGIN 
*********************************************************/
exports.login = (req, res, next) => {
    const userName = req.body.email;
	const password = req.body.password;

    console.table([userName, password]);

	if (userName && password) {
      bdd.query('SELECT * FROM users WHERE email= ?', userName, (error, results, fields) => {
           if (results.length > 0) {
            bcrypt.compare(password, results[0].password).then((valid) => {
              if (!valid) {
                res.status(401).json({ message: 'Mot de passe incorrect' })
              } else {
                console.log(userName, "s'est connecté")
                let status = ''
                console.log(results);
                if (results[0].niveau_acces === 1) {
                  status = 'admin'
                } else {
                  status = 'membre'
                }

                console.log(process.env.JWT_AUTH_SECRET_TOKEN);
                res.status(200).json({
                  userId: results[0].id,
                  email: results[0].email,
                  status: status,
                  token: jwt.sign({ userId: results[0].id, status: status },process.env.JWT_AUTH_SECRET_TOKEN,{ expiresIn: '24h' })
                })
                
              }
            })
          } 
          else {
            res.status(401).json({ message: 'Utilisateur ou mot de passe inconnu' })
          }
        }
      )
    } else {
      res.status(500).json({ message: "Entrez votre email et votre mot de passe" })
    }
  }
/* exports.login = (req, res) => {
    
    const email = req.body.email;
    const password = req.body.password;

    console.log(email);

    if (validator.isEmail(String(email))) {

        let sql= "SELECT id, email, password, niveau_acces FROM users WHERE email = ?";     // préparation de la requete SQL
        let inserts = [email];                                                                  // utilisation des valeurs à insérer
        sql = mysql.format(sql, inserts);                                                       // assemblage final de la requête

        const userLogin = bdd.query(sql, (error, user) => {   
            console.log(error, user);                                 // envoi de la requête a la base de données
            if (error) {                                                                        // si aucune correspondance avec un utilisateur n'a été trouvée
                return res.status(400).json({ error : "Votre email est invalide !" })           // l'email est donc invalide
            }
            if (user.length === 0) {
                res.status(400).json({ error: "Une erreur est survenue, utilisateur non trouvé !" })    // utilisateur introuvable
            }

            bcrypt.compare(password, user[0].password).then((valid) => {                        // si une correspondance avec un utilisateur a été trouvée alors on vérifie le mot de passe
                if (!valid) {                                                                   // si les deux mots de passes ne correspondent pas
                    return res.status(400).json({ error : "Mot de passe invalide !"})           // le mot de passe est donc invalide
                }

                res.status(200).json({                                                          // si la connexion est approuvée on retourne
                    message: "Vous êtes désormais connecté !",                                  // on renvoi un message de confirmation                                      
                    token: jwt.sign(                                                            // fonction sign qui prend les données que nous allons encoder à l'intérieur du token
                        { userId: user[0].id, niveau_acces: user[0].niveau_acces },             // création d'un objet avec le UserId et le niveau d'acces pour être sur de la correspondance
                        process.env.JWT_AUTH_SECRET_TOKEN,                                      // clé secrète pour l'encodage
                        { expiresIn: process.env.JWT_EXPIRATION }                               // configuration de l'expiration du token
                    )
                });
            });
        });
    }
}; */

/* READ 
*********************************************************/
exports.getOneUser = (req, res) => {

    const tokenInfos = decodeToken(req);        // on utilise la fonction decodeToken
    const userId = tokenInfos[0];               // on obtient le UserId du token

    if (userId === Number(req.params.id)) {
        let sql = "SELECT nom, prenom, email, departement, poste FROM users WHERE id = ?";  // préparation de la requete SQL
        let inserts = [userId];                                                             // utilisation des valeurs à insérer
        sql = mysql.format(sql, inserts);                                                   // assemblage final de la requête

        const userGetInfos = bdd.query(sql, (error, result) => {                            // envoi de la requête a la base de données
            if (error) {
                res.status(400).json({ error: "Une erreur est survenue, utilisateur non trouvé !" });          // utilisateur introuvable
            }
            if (result.length === 0) {
                res.status(400).json({ error: "Une erreur est survenue, utilisateur non trouvé !" })           // utilisateur introuvable
            } else {
                res.status(200).json(result[0]);
            }
        });
    } else {
        res.status(401).json({ error: "Action non autorisée !" });
    }
};

/* UPDATE 
*********************************************************/
exports.updateOneUser = (req, res) => { 

    const tokenInfos = decodeToken(req);            // on utilise la fonction decodeToken
    const userId = tokenInfos[0];                   // on obtient le UserId du token
   
    const nom = req.body.nom;
    const prenom = req.body.prenom;
    const email = req.body.email;
    const departement = req.body.departement;
    const poste = req.body.poste;
    const password = req.body.password;
    const newpassword = req.body.newpassword;

    if (validator.isEmail(String(email))) {     // si le format de l'email est valide

        if(!password & !newpassword) {                                                                                  // si les deux mots de passe sont vides
            let sql = "UPDATE users SET nom = ?, prenom = ?, email = ?, departement = ?, poste = ? WHERE id = ?";       // préparation de la requete SQL
            let inserts = [nom, prenom, email, departement, poste, userId];                                             // utilisation des valeurs à insérer
            sql = mysql.format(sql, inserts);                                                                           // assemblage final de la requête

            const userUpdateWithoutNewPassword = bdd.query(sql, (error, result) => {                                    // envoi de la requête a la base de données
                if (error) {
                    res.status(400).json({ error: "La mise à jour des informations de l'utilisateur a échoué" });
                } else {
                    res.status(200).json({ message: "Informations utilisateur mises à jour avec succès !" });
                }
            });
        } else {
            let sql= "SELECT password FROM users WHERE id = ?";                                                     // préparation de la requete SQL
            let inserts = [userId];                                                                                     // utilisation des valeurs à insérer
            sql = mysql.format(sql, inserts);                                                                           // assemblage final de la requête

            const userGetPassword = bdd.query(sql, (error, result) => {
                if (error) {                                                                                            // si aucune correspondance avec un utilisateur n'a été trouvée
                    res.status(400).json({ error: "Une erreur est survenue, utilisateur non trouvé !" })                // utilisateur introuvable
                }
                if (result.length === 0) {
                    res.status(400).json({ error: "Une erreur est survenue, utilisateur non trouvé !" })                // utilisateur introuvable
                } else {
                    bcrypt.compare(password, result[0].password).then((valid) => {                  // si une correspondance avec un utilisateur a été trouvée alors on vérifie le mot de passe
                        if (!valid) {                                                                   // si les deux mots de passes ne correspondent pas
                            res.status(400).json({ error : "Mot de passe actuel invalide !" })          // le mot de passe est donc invalide
                        } else {
                            bcrypt.hash(newpassword, 10, (error, hash) => {
                                let sql = "UPDATE users SET nom = ?, prenom = ?, email = ?, departement = ?, poste = ?, password = ? WHERE id = ?";
                                let inserts = [nom, prenom, email, departement, poste, hash, userId];
                                sql = mysql.format(sql, inserts);

                                const userUpdateWithNewPassword = bdd.query(sql, (error, result) => {
                                    if (error) {
                                        res.status(400).json({ error: "La mise à jour des informations de l'utilisateur a échoué" });
                                    } else {
                                        res.status(200).json({ message: "Informations et nouveau mot de passe utilisateur mis à jour avec succès !" });
                                    }
                                });
                            });
                        }
                    });
                }
            });
        }
    } else {
        res.status(400).json({ error : "Votre email est invalide !" })      // le format de l'email est invalide
    }
};

/* DELETE 
*********************************************************/
exports.deleteOneUser = (req, res) => {
    
    const tokenInfos = decodeToken(req);        // on utilise la fonction decodeToken
    const userId = tokenInfos[0];               // on obtient le UserId du token
   
    if (userId === Number(req.params.id)) {     // on vérifie que le UserId du token
        let sql = "DELETE FROM users WHERE id = ? ";
        let inserts = [userId];
        sql = mysql.format(sql, inserts);

        const userDelete = bdd.query(sql, (error, result) => {
            if (error) {
                res.status(400).json({ error: "Une erreur est survenue, utilisateur non trouvé !" });
            } else {
                res.status(200).json({ message: "Utilisateur supprimé avec succès !" });
            }
        });
    } else {
        res.status(400).json({ error: "Action non autorisée !" });
    }
};