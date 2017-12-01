Select Dataora, S1.Ritardo, IdCorsa, IdSegnalazione
From 
(Select * 
From Segnalazione
Where Elaborato=0 and SegnalazioneValida=1) As S1,
(Select IdCorsa,IdLinea,IdFermata
From Corsa_Fermata_Orario) As Id
Where Id.IdLinea=S1.Linea and Id.IdFermata=S1.IdFermata
Order by DataOra;

Select distinct Ritardo.IdCorsa,Ritardo From Ritardo, 
(Select IdCorsa
From 
(Select * 
From Segnalazione
Where Elaborato=0 and SegnalazioneValida=1) As S1,
(Select IdCorsa,IdLinea,IdFermata
From Corsa_Fermata_Orario) As Id
Where Id.IdLinea=S1.Linea and Id.IdFermata=S1.IdFermata) As T1
Where Ritardo.IdCorsa=T1.IdCorsa;

update Ritardo
set Ritardo='00:00:00'
where Ritardo.IdCorsa=IdCorsa;