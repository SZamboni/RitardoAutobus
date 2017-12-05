 CREATE TABLE IF NOT EXISTS Utente
(
	UserID INTEGER PRIMARY KEY AUTO_INCREMENT,
	Nome VARCHAR(50) NOT NULL,
	Cognome VARCHAR(50) NOT NULL,
	Email VARCHAR(100) NOT NULL,
	LinkFoto VARCHAR(200) NOT NULL,
	QualificationTypeId VARCHAR(200),
	WorkerId VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS Linea
(
	IdLinea INTEGER PRIMARY KEY AUTO_INCREMENT,
	NomeLinea VARCHAR(50) NOT NULL,
	NumeroLinea VARCHAR(5) NOT NULL
);

CREATE TABLE IF NOT EXISTS Fermata
(
	IdFermata INTEGER PRIMARY KEY AUTO_INCREMENT,
	NomeFermata VARCHAR(50),
	Latitudine DECIMAL(10,8) NOT NULL,
	Longitudine DECIMAL(11,8) NOT NULL,
	Direzione BIT(1) NOT NULL
);

CREATE TABLE IF NOT EXISTS Segnalazione
(
	IdSegnalazione INTEGER PRIMARY KEY AUTO_INCREMENT,
	IdSegnalatore INTEGER NOT NULL,
	IdFermata INTEGER NOT NULL,
	DataOra DATETIME NOT NULL,
    Ritardo TIME NOT NULL,
	Linea INTEGER NOT NULL,
	Latitudine DECIMAL(10,8) NOT NULL,
	Longitudine DECIMAL(11,8) NOT NULL,
	Elaborato BIT(1) DEFAULT 0 NOT NULL,
	SegnalazioneValida BIT(1) NOT NULL,
	FOREIGN KEY (IdSegnalatore) REFERENCES Utente(UserID),
	FOREIGN KEY (Linea) REFERENCES Linea(IdLinea),
	FOREIGN KEY (IdFermata) REFERENCES Fermata(IdFermata)
);

CREATE TABLE IF NOT EXISTS Linea_Fermata
(
	IdLinea INTEGER NOT NULL,
	IdFermata INTEGER NOT NULL,
	FOREIGN KEY (IdLinea) REFERENCES Linea(IdLinea),
	FOREIGN KEY (IdFermata) REFERENCES Fermata(IdFermata),
	PRIMARY KEY (IdLinea, IdFermata)
);

CREATE TABLE IF NOT EXISTS Corsa
(
	IdCorsa INTEGER PRIMARY KEY AUTO_INCREMENT,
	IdLinea INTEGER NOT NULL,
    Capolinea VARCHAR(45),
	FOREIGN KEY (IdLinea) REFERENCES Linea(IdLinea)
);

CREATE TABLE IF NOT EXISTS Corsa_Fermata_Orario
(
	IdCorsaFermataOrario INTEGER PRIMARY KEY AUTO_INCREMENT,
	IdCorsa INTEGER NOT NULL,
	IdLinea INTEGER NOT NULL,
	Orario TIME NOT NULL,
	IdFermata INTEGER NOT NULL,
	FOREIGN KEY (IdCorsa) REFERENCES Corsa(IdCorsa),
	FOREIGN KEY (IdLinea) REFERENCES Linea(IdLinea),
	FOREIGN KEY (IdFermata) REFERENCES Fermata(IdFermata)
);

CREATE TABLE IF NOT EXISTS Ritardo
(
	IdRitardo INTEGER PRIMARY KEY AUTO_INCREMENT,
	IdCorsa INTEGER NOT NULL,
	DataRitardo DATE,
	Ritardo TIME DEFAULT '00:00:00' NOT NULL,
	FOREIGN KEY (IdCorsa) REFERENCES Corsa(IdCorsa)
);

CREATE TABLE IF NOT EXISTS Utenti_Hit_Id
(
	UserID INTEGER NOT NULL,
    UtentiHitId VARCHAR(100),
    DataHit DATE,
    FOREIGN KEY (UserId) REFERENCES Utente(UserId)
);