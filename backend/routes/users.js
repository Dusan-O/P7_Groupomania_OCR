const bouncer = require ("express-bouncer")(500, 900000);                               // importation du paquet express-bouncer pour luter contre attaques par force brute
const express = require('express');                                                     // importation du paquet express
const router = express.Router();                                                        // création du router
const usersCtrl = require('../controllers/users.js')                                    // importation du controller users
const auth = require('../middleware/auth.js');                                          // importation de notre middleware d'authentification
const verifyPassword = require('../middleware/verify-password.js');                     // importation du middleware
const verifyPasswordUpdate = require('../middleware/verify-password-update.js');        // importation du middleware


router
    .post('/signup', usersCtrl.signup)                                                // inscription d'un utilisateur
    .post('/login', usersCtrl.login)                                                  // connexion d'un utilisateur
    .get('/:id', auth, usersCtrl.getOneUser)                                          // récupération d'un utilisateur
    .put('/update', auth, verifyPasswordUpdate, usersCtrl.updateOneUser)              // mise à jour d'un utilisateur
    .delete('/:id', auth, usersCtrl.deleteOneUser);                                   // suppresion d'un utilisateur


module.exports = router;        // on export le router du fichier