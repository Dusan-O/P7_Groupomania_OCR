require('dotenv').config();                                                         // IMPORT DOTENV
const fs = require('fs');                                                           // IMPORT NODE JS
const mysql = require('mysql2');                                                    // IMPORT MYSQL
const jwt = require('jsonwebtoken');                                                // IMPORT JWT
const querystring = require('querystring');                                         // IMPORT QUERYSTRING
const bdd = require("../bdd_config/bdd_connexion.js");                                 // IMPORT CONNEXTION DATABASE

let decodeToken = function(req){                                                    // DECODE TOKEN & GET USER ID
    let token = req.headers.authorization.split(' ')[1];                            // GET TOKEN FROM REQUEST HEADER
    let decodedToken = jwt.verify(token, process.env.JWT_AUTH_SECRET_TOKEN);        // DECODE TOKEN WITH VERIFY
    decodedToken = [decodedToken.userId, decodedToken.niveau_acces];                // GET TOKEN ACCESS LEVEL
    return decodedToken;                                                            // RETURN TABLE WITH USERID AND ACCESS LEVEL
}

// CREATE PUBLICATION****************************************************************
exports.createPublication = (req, res) => {
   

    const tokenInfos = decodeToken(req);                                            // DECODETOKEN FUNCTION
    const userId = tokenInfos[0];                                                   // GET TOKEN'S USER ID

    const titre = req.body.titre;                                                   // GET TITLE POST
    const description = req.body.description;   // GET DESCRIPTION POST
    
    if (req.file !== undefined) {                                                                               // IF IMAGE
        const imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;                    // PARAM THE URL
        let sql = "INSERT INTO publications (user_id, titre, description, image_url) VALUES (?, ?, ?, ? )";     // PREPARATION SQL REQUEST
        let inserts = [userId, titre, description, imageUrl];                                                   // USE VALUES
        sql = mysql.format(sql, inserts);                                                                       

        const publicationCreate = bdd.query(sql, (error, publication) => {                                      // SEND REQUEST TO DB
            if (!error) {
                res.status(201).json({ message: "Publication enregistrée" });
            } else {
                res.status(400).json({ message: "AUne erreur est survenue, la publication n'a pas été créée" });
            }
        });
    } else {
        const imageUrl = "";  
                                                                                        // IF NO IMAGE THEN EMPTY
        let sql = "INSERT INTO publications (user_id, titre, description, image_url) VALUES (?, ?, ?, ? )";     // PREPARATION SQL REQUEST
        let inserts = [userId, titre, description, imageUrl];                                                   // USE VALUES
        sql = mysql.format(sql, inserts);                                                                       

        const publicationCreate = bdd.query(sql, (error, publication) => {                                      // SEND REQUEST TO DB
            if (!error) {
                res.status(201).json({ message: "Publication enregistrée" });
            } else {
                res.status(400).json({ message: "BUne erreur est survenue, la publication n'a pas été créée" });
            }
        });
    } 
};

// GET ALL PUBLICATIONS****************************************************************
exports.getAllPublications = (req, res) => {
    const tokenInfos = decodeToken(req);        // DECODETOKEN
    const userId = tokenInfos[0];               // GET TOKEN'S USERID
    const page = req.query.page;              // GET PAGE # 
    let offset = 10;                            // OFFSET DEFAUT 10 (LIMIT # POST)

    offset = offset * (page - 1);               // MULTIPLY OFFSET BY PAGE #
    
    let sql = `SELECT   users.id AS publicationCreateByUserId,
                        users.nom AS publicationCreateByUserNom,
                        users.prenom AS publicationCreateByUserPrenom,
                        publications.id AS publicationId,
                        publications.creation_date AS publicationCreationDate,
                        publications.titre AS publicationTitre,
                        publications.description AS publicationDescription,
                        publications.image_url AS publicationImageUrl
                        
                        FROM publications
                        
                        INNER JOIN users ON publications.user_id = users.id
                        LIMIT 10 OFFSET ?
                        ;`;
                        
                        //GROUP BY publications.id ORDER BY publicationCreationDate DESC
    console.log(sql);
    let inserts = [offset];
    console.log(inserts);
    sql = mysql.format(sql, inserts);

    const getPublications = bdd.query(sql, (error, publications) => {
        console.log(publications);
        if (error) {
            return res.status(400).json({ error });
        } else {
            sql = `SELECT COUNT(*) as publicationsCount FROM publications;`;
            const getPublicationsTotal = bdd.query(sql, (error, publicationsTotalCount) => {
                if (error) {
                    res.status(400).json({ error: "Une erreur est survenue, aucune publication trouvée !" });
                } else {
                    res.status(200).json([publications, publicationsTotalCount]);
                }
            });
        }
    });
};

// GET MOST RECENT PUBLICATIONS****************************************************************
exports.getMostRecentPublications = (req, res) => {


    const tokenInfos = decodeToken(req);        // DECODETOKEN
    const userId = tokenInfos[0];               // TOKEN'S USERID
    const page = req.query.page;                
    let offset = 10;                            

    offset = offset * (page - 1);               

    let sql = `SELECT   
    users.id AS publicationCreateByUserId,
    users.nom AS publicationCreateByUserNom,
    users.prenom AS publicationCreateByUserPrenom,
    publications.id AS publicationId,
    publications.creation_date AS publicationCreationDate,
    publications.titre AS publicationTitre,
    publications.description AS publicationDescription,
    publications.image_url AS publicationImageUrl
    
    FROM publications
    
    INNER JOIN users ON publications.user_id = users.id 
    ORDER BY publications.creation_date DESC
    LIMIT 10 OFFSET ?
    ;`;

    let inserts = [userId, offset];
    sql = mysql.format(sql, inserts);

    const getPublications = bdd.query(sql, (error, publications) => {
        if (error) {
            res.status(400).json({ error: "Une erreur est survenue, aucune publication trouvée !" });
        } else {
            sql = `SELECT COUNT(*) as publicationsCount FROM publications;`;
            const getPublicationsTotal = bdd.query(sql, (error, publicationsTotalCount) => {
                if (error) {
                    res.status(400).json({ error: "Une erreur est survenue, aucune publication trouvée !" });
                } else {
                    res.status(200).json([publications, publicationsTotalCount]);
                }
            });
        }
    });
};

// GET MOST LIKED PUBLICATIONS****************************************************************
exports.getMostLikedPublications = (req, res) => {


    const tokenInfos = decodeToken(req);        
    const userId = tokenInfos[0];               
    const page = req.query.page;                
    let offset = 10;                            

    offset = offset * (page - 1);               

    let sql = `SELECT   user.id AS publicationCreateByUserId,
                        user.nom AS publicationCreateByUserNom,
                        user.prenom AS publicationCreateByUserPrenom,
                        publication.id AS publicationId,
                        publication.creation_date AS publicationCreationDate,
                        publication.titre AS publicationTitre,
                        publication.description AS publicationDescription,
                        publication.image_url AS publicationImageUrl,

                        (SELECT COUNT(if(vote = 2, 1, NULL)) FROM votes WHERE publication_id = publication.id) AS publicationLikeCount,
                        (SELECT COUNT(if(vote = 3, 1, NULL)) FROM votes WHERE publication_id = publication.id) AS publicationDislikeCount,
                        (SELECT COUNT(if(publication_id = publication.id, 1, NULL)) FROM commentaires WHERE publication_id = publication.id) AS publicationCommentCount,
                        (SELECT vote FROM votes WHERE user_id = ? AND publicationId = votes.publication_id) AS userVote

                        FROM publications AS publication
                        
                        JOIN users AS user ON publication.user_id = user.id
                        GROUP BY publication.id ORDER BY publicationLikeCount DESC
                        LIMIT 10 OFFSET ?;`;

    let inserts = [userId, offset];
    sql = mysql.format(sql, inserts);

    const getPublications = bdd.query(sql, (error, publications) => {
        if (error) {
            res.status(400).json({ error: "Une erreur est survenue, aucune publication trouvée !" });
        } else {
            sql = `SELECT COUNT(*) FROM publications;`;
            const getPublicationsTotal = bdd.query(sql, (error, publicationsTotalCount) => {
                if (error) {
                    res.status(400).json({ error: "Une erreur est survenue, aucune publication trouvée !" });
                } else {
                    res.status(200).json([publications, publicationsTotalCount]);
                }
            });
        }
    });
};

// GET MOST COMMENTED PUBLICATIONS****************************************************************
exports.getMostCommentedPublications = (req, res) => {


    const tokenInfos = decodeToken(req);        
    const userId = tokenInfos[0];               
    const page = req.query.page;                
    let offset = 10;                            

    offset = offset * (page - 1);               

    let sql = `SELECT   user.id AS publicationCreateByUserId,
                        user.nom AS publicationCreateByUserNom,
                        user.prenom AS publicationCreateByUserPrenom,
                        publication.id AS publicationId,
                        publication.creation_date AS publicationCreationDate,
                        publication.titre AS publicationTitre,
                        publication.description AS publicationDescription,
                        publication.image_url AS publicationImageUrl,

                        (SELECT COUNT(if(vote = 2, 1, NULL)) FROM votes WHERE publication_id = publication.id) AS publicationLikeCount,
                        (SELECT COUNT(if(vote = 3, 1, NULL)) FROM votes WHERE publication_id = publication.id) AS publicationDislikeCount,
                        (SELECT COUNT(if(publication_id = publication.id, 1, NULL)) FROM commentaires WHERE publication_id = publication.id) AS publicationCommentCount,
                        (SELECT vote FROM votes WHERE user_id = ? AND publicationId = votes.publication_id) AS userVote

                        FROM publications AS publication
                        
                        JOIN users AS user ON publication.user_id = user.id
                        GROUP BY publication.id ORDER BY publicationCommentCount DESC
                        LIMIT 10 OFFSET ?;`;

    let inserts = [userId, offset];
    sql = mysql.format(sql, inserts);

    const getPublications = bdd.query(sql, (error, publications) => {
        if (error) {
            res.status(400).json({ error: "Une erreur est survenue, aucune publication trouvée !" });
        } else {
            sql = `SELECT COUNT(*) FROM publications;`;
            const getPublicationsTotal = bdd.query(sql, (error, publicationsTotalCount) => {
                if (error) {
                    res.status(400).json({ error: "Une erreur est survenue, aucune publication trouvée !" });
                } else {
                    res.status(200).json([publications, publicationsTotalCount]);
                }
            });
        }
    });
};

// GET ONE USER ALL PUBLICATIONS****************************************************************
exports.getOneUserAllPublications = (req, res, next) => {

    const tokenInfos = decodeToken(req);        
    const userId = tokenInfos[0];               

    let sql = `SELECT   user.id AS publicationCreateByUserId,
                        user.nom AS publicationCreateByUserNom,
                        user.prenom AS publicationCreateByUserPrenom,
                        publication.id AS publicationId,
                        publication.creation_date AS publicationCreationDate,
                        publication.titre AS publicationTitre,
                        publication.description AS publicationDescription,
                        publication.image_url AS publicationImageUrl,

                        (SELECT COUNT(if(vote = 2, 1, NULL)) FROM votes WHERE publication_id = publication.id) AS publicationLikeCount,
                        (SELECT COUNT(if(vote = 3, 1, NULL)) FROM votes WHERE publication_id = publication.id) AS publicationDislikeCount,
                        (SELECT COUNT(if(publication_id = publication.id, 1, NULL)) FROM commentaires WHERE publication_id = publication.id) AS publicationCommentCount,
                        (SELECT vote FROM votes WHERE user_id = ? AND publicationId = votes.publication_id) AS userVote

                        FROM publications AS publication
                        
                        JOIN users AS user ON publication.user_id = user.id
                        WHERE user.id = ?
                        GROUP BY publication.id ORDER BY publicationCreationDate DESC;`;

    let inserts = [userId, userId];
    sql = mysql.format(sql, inserts);

    const getOneUserAllPublications = bdd.query(sql, (error, publications) => {
        if (error) {
            res.status(400).json({ error: "Une erreur est survenue, aucune publication trouvée !" });
        } else {
            res.status(200).json(publications);
        }
    });
};

// GET ONE PUBLICATION****************************************************************
exports.getOnePublication = (req, res, next) => {


    const tokenInfos = decodeToken(req);        
    const userId = tokenInfos[0];               
    const publicationId = req.params.id;        
    const sqlPublication = `SELECT   user.id AS publicationCreateByUserId,
                        user.nom AS publicationCreateByUserNom,
                        user.prenom AS publicationCreateByUserPrenom,
                        publication.id AS publicationId,
                        publication.creation_date AS publicationCreationDate,
                        publication.titre AS publicationTitre,
                        publication.description AS publicationDescription,
                        publication.image_url AS publicationImageUrl,

                        (SELECT COUNT(if(vote = 2, 1, NULL)) FROM votes WHERE publication_id = publication.id) AS publicationLikeCount,
                        (SELECT COUNT(if(vote = 3, 1, NULL)) FROM votes WHERE publication_id = publication.id) AS publicationDislikeCount,
                        (SELECT COUNT(if(publication_id = publication.id, 1, NULL)) FROM commentaires WHERE publication_id = publication.id) AS publicationCommentCount,
                        (SELECT vote FROM votes WHERE user_id = ? AND publicationId = votes.publication_id) AS userVote

                        FROM publications AS publication
                        
                        JOIN users AS user ON publication.user_id = user.id
                        WHERE publication.id = ? 
                        GROUP BY publication.id,
                        user.id,
                        user.nom,
                        user.prenom,
                        publication.creation_date,
                        publication.titre,
                        publication.description,
                        publication.image_url
                        ORDER BY publicationCreationDate DESC;`;

    const sqlCommentaires = `SELECT user.id AS commentaireCreateByUserId,
                                    user.nom AS commentaireCreateByUserNom,
                                    user.prenom AS commentaireCreateByUserPrenom,

                                    commentaire.id AS commentaireId,
                                    commentaire.creation_date AS commentaireCreationDate, 
                                    commentaire.message AS commentaireMessage

                                    FROM commentaires AS commentaire

                                    JOIN users AS user ON commentaire.user_id = user.id
                                    WHERE publication_id = ?
                                    GROUP BY commentaire.id ORDER BY commentaireCreationDate;`;

    const firstInserts = [userId, publicationId];
    const firstSql = mysql.format(sqlPublication, firstInserts);

    const secondInserts = [publicationId];
    const secondSql = mysql.format(sqlCommentaires, secondInserts);

    const getOnePublication = bdd.query(firstSql, (error, result) => {
        if (!error) {
            const publication = result;
            const getOnePublicationCommentaires = bdd.query(secondSql, (error, result) => {
                if (!error) {
                    const commentaires = result;
                    const finalReponse = {
                        publication: publication,
                        commentaires: commentaires
                    }
                    res.status(200).json(finalReponse)
                }
            });
        } else {
            console.log(error)
            res.status(400).json({ error: "Une erreur est survenue, aucune publication trouvée !" });
        } 
    });
};

// DELETE PUBLICATION****************************************************************
exports.deletePublication = (req, res) => {

    const tokenInfos = decodeToken(req);                                
    const userId = tokenInfos[0];                                       
    const niveauAcces = tokenInfos[1];                                  
    const publicationId = req.params.id;                                

    if (niveauAcces === 1) {                                                    // IF LEVEL ACCESS 1 (ADMIN)
        let firstSql = "SELECT image_url FROM publications WHERE id = ?;"
        let secondSql = "DELETE FROM publications WHERE id = ?;";               // PREPARATION MYSQL REQUEST
        let inserts = [publicationId];                                          // USE VALUES TO INSERT
        firstSql = mysql.format(firstSql, inserts);                             
        secondSql = mysql.format(secondSql, inserts);                           
        let role = "Modérateur";

        const publicationImageUrl = bdd.query(firstSql, (error, image) => {     // SEND REQUEST TO DB
            if (!error) {
                if(image[0].image_url !== "") {
                    const filename = image[0].image_url.split("/images/")[1];   // EXTRACT FILE NAME TO DELETE
                    fs.unlink(`images/${filename}`, () => {                     // DELETE WITH FS.UNLINK
                    });
                }
                const publicationDelete = bdd.query(secondSql, (error, result) => {   // SEND REQUEST TO DB
                    if (!error) {
                        if (result.affectedRows === 0) {
                            res.status(400).json({ message: "Vous n'êtes pas autorisé à supprimer cette publication !" });
                        } else {
                            res.status(200).json({ message: "La publication a été supprimée !" + " (" + role + ")" });
                        }
                    } else {
                        res.status(400).json({ message: "Une erreur est survenue, la publication n'a pas été supprimée" });
                    }
                });
            } else {
                res.status(400).json({ message: "Une erreur est survenue, la publication n'a pas été trouvée" });
            }
        });
    } else {          
        let firstSql = "SELECT image_url FROM publications WHERE id = ?;"
        let secondSql = "DELETE FROM publications WHERE id = ? AND user_id = ?;";    // PREPARATION SQL REQUEST
        let firstInserts = [publicationId];                                          
        let secondInserts = [publicationId, userId]; 
        firstSql = mysql.format(firstSql, firstInserts);                                       
        secondSql = mysql.format(secondSql, secondInserts);                                       
        let role = "Utilisateur";

        const publicationImageUrl = bdd.query(firstSql, (error, image) => {          // SEND REQUEST TO DB
            if (image && !error) {
                console.log(image);
                if(image[0].image_url !== "") {
                    const filename = image[0].image_url.split("/images/")[1];           
                    fs.unlink(`images/${filename}`, () => {                        
                    });
                }
                const publicationDelete = bdd.query(secondSql, (error, result) => {         // SEND REQUEST TO DB
                    if (!error) {
                        if (result.affectedRows === 0) {
                            res.status(400).json({ message: "Vous n'êtes pas autorisé à supprimer cette publication !" });
                        } else {
                            res.status(200).json({ message: "La publication a été supprimée !" + " (" + role + ")" });
                        }
                    } else {
                        res.status(400).json({ message: "Une erreur est survenue, la publication n'a pas été supprimée" });
                    }
                });
            } else { 
                res.status(400).json({ message: "Une erreur est survenue, la publication n'a pas été trouvée" });
            }
        });
    }
};

// COMMENT PUBLICATION****************************************************************
exports.commentPublication = (req, res) => {

    const tokenInfos = decodeToken(req);                                
    const userId = tokenInfos[0];                                      
    
    const publicationId = req.body.publicationId;                       
    const message = req.body.message;                                    

    let sql = "INSERT INTO commentaires (user_id, publication_id, message) VALUES (?, ?, ?)";   
    let inserts = [userId, publicationId, message];                                             
    sql = mysql.format(sql, inserts);                                                           

    const commentaireCreate = bdd.query(sql, (error, result) => {                               
        if (!error) {
            res.status(201).json({ message: "Le commentaire a bien été créé" });
        } else {
            res.status(400).json({ message: "Une erreur est survenue, le commentaire n'a pas été créé" });
        }
    });
};

// DELETE COMMENT****************************************************************
exports.deleteComment = (req, res) => {
    
    const tokenInfos = decodeToken(req);                                
    const userId = tokenInfos[0];                                       
    const niveauAcces = tokenInfos[1];                                  

    const commentaireId = req.params.id;                                

    if (niveauAcces === 1) {                                                    
        let sql = "DELETE FROM commentaires WHERE id = ?";                      
        let inserts = [commentaireId];                                          
        sql = mysql.format(sql, inserts);                                       
        let role = "Modérateur";

        const commentaireDelete = bdd.query(sql, (error, result) => {               
            if (!error) {
                res.status(200).json({ message: "Le commentaire a été supprimé !" + " (" + role + ")" });
            } else {
                res.status(400).json({ message: "Une erreur est survenue, le commentaire n'a pas été supprimé" });
            }
        });
    } else {                                                                   
        let sql = "DELETE FROM commentaires WHERE id = ? AND user_id = ?";      
        let inserts = [commentaireId, userId];                                  
        sql = mysql.format(sql, inserts);                                       
        let role = "Utilisateur";

        const commentaireDelete = bdd.query(sql, (error, result) => {               
            if (!error) {
                if (result.affectedRows === 0) {
                    res.status(400).json({ message: "Vous n'êtes pas autorisé à supprimer ce commentaire !" });
                } else {
                res.status(200).json({ message: "Le commentaire a été supprimé !" + " (" + role + ")" });
                }
            } else {
                res.status(400).json({ message: "Une erreur est survenue, le commentaire n'a pas été supprimé" });
            }
        });
    }
};

// VOTE PUBLICATION****************************************************************
exports.votePublication = (req, res) => {

    const tokenInfos = decodeToken(req);                                
    const userId = tokenInfos[0];                                       

    const publicationId = req.body.publicationId;                       
    const vote = req.body.vote;                                         
    const alreadyVote = req.body.alreadyVote;                           

    switch (vote) {
        case 1 : // NO LIKE / NO DISLIKE
            try {
                let sql = "UPDATE votes SET vote = 1 WHERE publication_id = ? AND user_id = ?";     
                let inserts = [publicationId, userId];                                              
                sql = mysql.format(sql, inserts);                                                   

                const voteNullUpdate = bdd.query(sql, (error, result) => {                          
                    if (error) {
                        res.status(400).json({ error: "La modification de votre vote a échouée ! (null)" });
                    } else {
                        res.status(200).json({ message: "Votre vote a été modifié avec succès ! (null)" });
                    }
                });
            } catch (error) {
                res.status(400).json({ error: "Une erreur est survenue, la modification de votre vote a échouée ! (null)" });
            }
            break;

        case 2 : // LIKE
            try {
                if (alreadyVote) {                                                                      
                    let sql = "UPDATE votes SET vote = 2 WHERE publication_id = ? AND user_id = ?";     
                    let inserts = [publicationId, userId];                                              
                    sql = mysql.format(sql, inserts);                                                   

                    const voteLikeUpdate = bdd.query(sql, (error, result) => {                              
                        if (error) {
                            res.status(400).json({ error: "La modification de votre vote a échouée ! (like)" });
                        } else {
                            res.status(200).json({ message: "Votre vote a été modifié avec succès ! (like)" });
                        }
                    });
                } else {
                    let sql = "INSERT INTO votes (publication_id, user_id, vote) VALUES (?, ?, 2)";     
                    let inserts = [publicationId, userId];                                              
                    sql = mysql.format(sql, inserts);                                                   

                    const voteLikeUpdate = bdd.query(sql, (error, result) => {                              
                        if (error) {
                            res.status(400).json({ error: "La modification de votre vote a échouée ! (like)" });
                        } else {
                            res.status(200).json({ message: "Votre vote a été modifié avec succès ! (like)" });
                        }
                    });
                }
            } catch (error) {
                res.status(400).json({ error: "Une erreur est survenue, la modification de votre vote a échouée ! (like)" });
            }
            break;

        case 3 : // DISLIKE
            try {
                if (alreadyVote) {                                                                      
                    let sql = "UPDATE votes SET vote = 3 WHERE publication_id = ? AND user_id = ?";     
                    let inserts = [publicationId, userId];                                              
                    sql = mysql.format(sql, inserts);                                                   

                    const voteLikeUpdate = bdd.query(sql, (error, result) => {                              
                        if (error) {
                            res.status(400).json({ error: "La modification de votre vote a échouée ! (dislike)" });
                        } else {
                            res.status(200).json({ message: "Votre vote a été modifié avec succès ! (dislike)" });
                        }
                    });
                } else {
                    let sql = "INSERT INTO votes (publication_id, user_id, vote) VALUES (?, ?, 3)";     
                    let inserts = [publicationId, userId];                                              
                    sql = mysql.format(sql, inserts);                                                   

                    const voteLikeUpdate = bdd.query(sql, (error, result) => {                              
                        if (error) {
                            res.status(400).json({ error: "La modification de votre vote a échouée ! (dislike)" });
                        } else {
                            res.status(200).json({ message: "Votre vote a été modifié avec succès ! (dislike)" });
                        }
                    });
                }
            } catch (error) {
                res.status(400).json({ error: "Une erreur est survenue, la modification de votre vote a échouée ! (dislike)" });
            }
            break;
    }
};