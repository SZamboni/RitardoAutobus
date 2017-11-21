CREATE DATABASE Ritardi_Autobus;

CREATE TABLE Utenti
{
	UserID INTEGER PRIMARY KEY,
	Username STRING(30),
	Password STRING(30),
	Email STRING(30),
	Conto_Corrente STRING(30)
};

CREATE TABLE Segnalazioni
{
	IdSegnalazione INTEGER PRIMARY KEY,
	IdSegnalatore INTEGER,
	DataOra DATETIME,
	Posizione POINT,
	Linea STRING(5),
	FOREIGN KEY (IdSegnalatore) REFERENCES Utenti(UserID)
};

CREATE TABLE Linea
{
	IdLinea INTEGER PRIMARY KEY
};

CREATE TABLE Fermata
{
	IdFermata INTEGER PRIMARY KEY,
	Posizione POINT
};

CREATE TABLE Linea_Fermata
{
	IdLinea INTEGER,
	IdFermata INTEGER,
	FOREIGN KEY (IdLinea) REFERENCES Linea(IdLinea),
	FOREIGN KEY (IdFermata) REFERENCES Fermata(IdFermata)
};

CREATE TABLE Autobus
{
	IdAutobus INTEGER PRIMARY KEY,
	IdLinea INTEGER,
	FOREIGN KEY (IdLinea) REFERENCES Linea(IdLinea)
};

CREATE TABLE Autobus_Fermata_Orario
{
	IdAutobusFermataOrario INTEGER PRIMARY KEY,
	IdAutobus INTEGER,
	IdLinea INTEGER,
	Orario TIME,
	IdFermata INTEGER,
	FOREIGN KEY (IdAutobus) REFERENCES Autobus(IdAutobus),
	FOREIGN KEY (IdLinea) REFERENCES Autobus(IdLinea),
	FOREIGN KEY (IdFermata) REFERENCES Fermata(IdFermata)
};

CREATE TABLE Ritardi
{
	IdRitardo INTEGER PRIMARY KEY,
	IdAutobusFermataOrario INTEGER,
	Ritardo TIME,
	FOREIGN KEY (IdAutobusFermataOrario) REFERENCES Autobus_Fermata_Orario(IdAutobusFermataOrario)
};