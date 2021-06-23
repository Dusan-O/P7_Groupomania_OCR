CREATE TABLE `users` (                                                      /* CREATION TABLE USERS */
  `id` int PRIMARY KEY AUTO_INCREMENT,                                      /* CLE PRIMAIRE => USER ID */
  `creation_date` TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP),           /* DATE DE CREATION DU USER*/
  `nom` varchar(30) DEFAULT NULL,                                           /* NPM */
  `prenom` varchar(30) DEFAULT NULL,                                        /* PRENOM */
  `email` varchar(60) NOT NULL UNIQUE,                                      /* EMAIL UNIQUE  */
  `departement` varchar(30) DEFAULT NULL,                                   /* DEPARTEMENT */
  `poste` varchar(30) DEFAULT NULL,                                         /* POSTE */
  `password` varchar(100) NOT NULL,                                     /* MOT DE PASSE */
  `niveau_acces` int DEFAULT NULL                                           /* NIVEAU D'ACCES, rôle, droit */
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=1;     /* TABLE INNODB (PERMET L'UTILISATION DES CLEFS ETRANGERES) */


CREATE TABLE `publications` (                                                                                 /* CREATION TABLE PUBLICATIONS */
  `id` int AUTO_INCREMENT,                                                                                    /* PUBLICATIOON ID */
  `user_id` int NOT NULL,                                                                                     /* USER ID CREATEUR DE LA PUBLICATOION */
  `creation_date` TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP),                                             /* DATE DE CREATION DE LA PUBLICATION */
  `titre` text NOT NULL,                                                                                      /* TITRE */
  `description` text NOT NULL,                                                                                /* DESCRIPTION */
  `image_url` text DEFAULT NULL,                                                                              /* URL IMAGE */
  PRIMARY KEY (`id`,`user_id`),                                                                               /* CLEF PRIMAIRE COMPOSITE => PUBLICATION ID + USER ID */
  CONSTRAINT `fk_publication_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE     /* CLEF ETRANGERE SUR LA COLONNE "USER_ID" QUI SE SERT DE LA TABLE "USERS" ET DE LA CONOLLE "ID" COMME REFERENCE */
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=1;                                        /* TABLE INNODB (PERMET L'UTILISATION DES CLEFS ETRANGERES) */


CREATE TABLE `commentaires` (                                                                                                    /* CREATION TABLE COMMENTAIRES */
  `id` int AUTO_INCREMENT,                                                                                                        /* COMMENTAIRES ID */
  `user_id` int NOT NULL,                                                                                                         /* USER ID CREATEUR DU COMMENTAIRE  */
  `publication_id` int NOT NULL,                                                                                                  /* PUBLICATION ID LIEE AU COMMENTAIRE */
  `creation_date` TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP),                                                                 /* DATE DE CREATUON DU COMMENTAIRE */
  `message` text NOT NULL,                                                                                                        /* MESSAGE */
  PRIMARY KEY (`id`, `user_id`, `publication_id`),                                                                                /* CLEF PRIMAIRE COMPOSITE => COMMENTAIRE ID + PUBLICATION ID + USER ID */
  CONSTRAINT `fk_commentaire_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,                        /* CLEF ETRANGERE SUR LA COLONNE "USER_ID" QUI SE SERT DE LA TABLE "USERS" ET DE LA CONOLLE "ID" COMME REFERENCE */
  CONSTRAINT `fk_commentaire_publication_id` FOREIGN KEY (`publication_id`) REFERENCES `publications` (`id`) ON DELETE CASCADE    /* CLEF ETRANGERE SUR LA COLONNE "USER_ID" QUI SE SERT DE LA TABLE "PUBLICATION" ET DE LA CONOLLE "ID" COMME REFERENCE */
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=1;                                                           /* TABLE INNODB (PERMET L'UTILISATION DES CLEFS ETRANGERES) */


CREATE TABLE `votes` (                                                                                                      /* CREATION DE LA TABLE VOTES */
  `id` int AUTO_INCREMENT,                                                                                                  /* VOTE ID */
  `user_id` int NOT NULL,                                                                                                   /* USER ID CREATEUR DU VOTE du vote */
  `publication_id` int NOT NULL,                                                                                            /* PUBLCIATION ID LIE AU VOTE */
  `vote` int DEFAULT NULL,                                                                                                  /* VOTE */
  PRIMARY KEY (`id`, `user_id`, `publication_id`),                                                                          /* CLEF PRIMAIRE COMPOSITE => COMMENTAIRE ID + PUBLICATION ID + USER ID */
  CONSTRAINT `fk_vote_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,                        /* CLEF ETRANGERE SUR LA COLONNE "USER_ID" QUI SE SERT DE LA TABLE "USERS" ET DE LA CONOLLE "ID" COMME REFERENCE */
  CONSTRAINT `fk_vote_publication_id` FOREIGN KEY (`publication_id`) REFERENCES `publications` (`id`) ON DELETE CASCADE     /* CLEF ETRANGERE SUR LA COLONNE "USER_ID" QUI SE SERT DE LA TABLE "PUBLICATION" ET DE LA CONOLLE "ID" COMME REFERENCE */
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin AUTO_INCREMENT=1;                                                     /* TABLE INNODB (PERMET L'UTILISATION DES CLEFS ETRANGERES) */