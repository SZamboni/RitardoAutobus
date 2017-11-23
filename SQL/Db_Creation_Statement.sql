CREATE TABLE Utenti
(
	UserID INTEGER PRIMARY KEY,
	User VARCHAR(50),
	Pass VARCHAR(50),
	Email VARCHAR(100)
);

CREATE TABLE Linea
(
	IdLinea INTEGER PRIMARY KEY,
    NomeLinea VARCHAR(5)
);

CREATE TABLE Segnalazioni
(
	IdSegnalazione INTEGER PRIMARY KEY,
	IdSegnalatore INTEGER,
	DataOra DATETIME,
	Posizione POINT,
	Linea INTEGER,
	FOREIGN KEY (IdSegnalatore) REFERENCES Utenti(UserID),
    FOREIGN KEY (Linea) REFERENCES Linea(IdLinea)
);

CREATE TABLE Fermata
(
	IdFermata INTEGER PRIMARY KEY,
    NomeFermata VARCHAR(50),
	Posizione POINT
);

CREATE TABLE Linea_Fermata
(
	IdLinea INTEGER,
	IdFermata INTEGER,
	FOREIGN KEY (IdLinea) REFERENCES Linea(IdLinea),
	FOREIGN KEY (IdFermata) REFERENCES Fermata(IdFermata),
    primary key (IdLinea, IdFermata)
);

CREATE TABLE Autobus
(
	IdAutobus INTEGER PRIMARY KEY,
	IdLinea INTEGER,
	FOREIGN KEY (IdLinea) REFERENCES Linea(IdLinea)
);

CREATE TABLE Autobus_Fermata_Orario
(
	IdAutobusFermataOrario INTEGER PRIMARY KEY,
	IdAutobus INTEGER,
	IdLinea INTEGER,
	Orario TIME,
	IdFermata INTEGER,
	FOREIGN KEY (IdAutobus) REFERENCES Autobus(IdAutobus),
	FOREIGN KEY (IdLinea) REFERENCES Autobus(IdLinea),
	FOREIGN KEY (IdFermata) REFERENCES Fermata(IdFermata)
);

CREATE TABLE Ritardi
(
	IdRitardo INTEGER PRIMARY KEY,
	IdAutobusFermataOrario INTEGER,
	Ritardo TIME,
	FOREIGN KEY (IdAutobusFermataOrario) REFERENCES Autobus_Fermata_Orario(IdAutobusFermataOrario)
);