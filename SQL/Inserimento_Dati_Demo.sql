INSERT INTO Utente (Nome,Cognome,Email,LinkFoto)
VALUES ("Francesco","Loda","francesco@gmail.com","http://www.nuovasocieta.it/wp-content/uploads/2013/11/papafrancesco.jpg");

INSERT INTO Linea (NomeLinea,Direzione)
VALUES ("5 - Direzione Oltrecastello",1);

INSERT INTO Linea (NomeLinea,Direzione)
VALUES ("5 - Direzione Piazza Dante",0);

INSERT INTO Fermata (NomeFermata,Latitudine,Longitudine,Direzione)
VALUES ("Povo Piazza Manci",46.065806,11.154617,1);

INSERT INTO Fermata (NomeFermata,Latitudine,Longitudine,Direzione)
VALUES ("Povo Piazza Manci",46.065956 ,11.154595,0);

INSERT INTO Corsa (IdLinea)
VALUES (1);

INSERT INTO Corsa (IdLinea) 
VALUES (2);

INSERT INTO Corsa_Fermata_Orario (IdCorsa,IdLinea,Orario,IdFermata)
VALUES (1,1,'16:20:00',1);

INSERT INTO Linea_Fermata(IdLinea,IdFermata)
VALUES (1,1);

INSERT INTO Linea_Fermata(IdLinea,IdFermata)
VALUES (2,2);

INSERT INTO Segnalazione(IdSegnalatore,DataOra,Linea,Latitudine,Longitudine)
VALUES (1,'2017-11-24 16:22:27',1,46.065970,11.154700);

INSERT INTO Ritardo(IdCorsa,DataRitardo,Ritardo)
VALUES (1,'2017-11-24','00:02:27');