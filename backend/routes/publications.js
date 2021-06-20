const express = require('express');                                     // importation du paquet express
const router = express.Router();                                        // création du router
const publicationsCtrl = require('../controllers/publications');        // importation du controller publications
const auth = require('../middleware/auth');                             // importation de notre middleware d'authentification
const multer = require('../middleware/multer-config');                  // importation de notre middleware multer

router.post('/', auth, multer, publicationsCtrl.createPublication)                      // Création d'une publication
    .get("/", auth, publicationsCtrl.getAllPublications)                              // Récupération de toutes les publications
    .get("/most-recent", auth, publicationsCtrl.getMostRecentPublications)            // Récupération des publications les plus récentes
    .get("/most-liked", auth, publicationsCtrl.getMostLikedPublications)              // Récupération des publications les plus aimées
    .get("/most-commented", auth, publicationsCtrl.getMostCommentedPublications)      // Récupération des publications les plus commentées
    .get("/user", auth, publicationsCtrl.getOneUserAllPublications)                   // Récupération des publications d'un utilisateur
    .get("/:id", auth, publicationsCtrl.getOnePublication)                            // Récupération d'une publication
    .delete("/:id", auth, publicationsCtrl.deletePublication)                         // Suppresion d'une publication
    .post('/commentaire', auth, publicationsCtrl.commentPublication)                  // Création d'un commentaire
    .delete("/commentaire/:id", auth, publicationsCtrl.deleteComment)                 // Suppression d'un commentaire
    .post('/vote', auth, publicationsCtrl.votePublication);                           // Modification d'un vote (like/dislike/null)

module.exports = router;        // on export le router du fichier