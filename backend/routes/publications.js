const router = require('express').Router();
const postController = require('../controllers/publications.js');        // importation du controller publications
const auth = require('../middleware/auth');                             // importation de notre middleware d'authentification
const multer = require('../middleware/multer-config');                  // importation de notre middleware multer

router
    .post('/', postController.createPublication)                      // Création d'une publication
    .get("/", auth, postController.getAllPublications)                              // Récupération de toutes les publications
    .get("/most-recent", auth, postController.getMostRecentPublications)            // Récupération des publications les plus récentes
    .get("/most-liked", auth, postController.getMostLikedPublications)              // Récupération des publications les plus aimées
    .get("/most-commented", auth, postController.getMostCommentedPublications)      // Récupération des publications les plus commentées
    .get("/user", auth, postController.getOneUserAllPublications)                   // Récupération des publications d'un utilisateur
    .get("/:id", auth, postController.getOnePublication)                            // Récupération d'une publication
    .delete("/:id", auth, postController.deletePublication)                         // Suppresion d'une publication
    .post('/commentaire', auth, postController.commentPublication)                  // Création d'un commentaire
    .delete("/commentaire/:id", auth, postController.deleteComment)                 // Suppression d'un commentaire
    .post('/vote', auth, postController.votePublication);                           // Modification d'un vote (like/dislike/null)

module.exports = router;        // on export le router du fichier