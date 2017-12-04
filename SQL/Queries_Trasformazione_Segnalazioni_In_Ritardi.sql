Select Dataora, S1.Ritardo, IdCorsa, IdSegnalazione
From 
(Select * 
From Segnalazione
Where Elaborato=0 and SegnalazioneValida=1) As S1,
(Select IdCorsa,IdLinea,IdFermata
From Corsa_Fermata_Orario) As Id
Where Id.IdLinea=S1.Linea and Id.IdFermata=S1.IdFermata
Order by DataOra;

update Segnalazione set Elaborato=0 where IdSegnalazione = 5 OR IdSegnalazione = 6 OR IdSegnalazione = 9 OR IdSegnalazione = 10 OR IdSegnalazione = 13 OR IdSegnalazione = 22 OR IdSegnalazione = 41;

Select Dataora, S1.Ritardo, IdCorsa, IdSegnalazione From (Select * From Segnalazione Where Elaborato=0 and SegnalazioneValida=1) As S1, (Select IdCorsa,IdLinea,IdFermata From Corsa_Fermata_Orario) As Id Where Id.IdLinea=S1.Linea and Id.IdFermata=S1.IdFermata Order by DataOra;

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

Select distinct Ritardo.IdCorsa,Ritardo From Ritardo, (Select IdCorsa From (Select * From Segnalazione Where Elaborato=0 and SegnalazioneValida=1) As S1, (Select IdCorsa,IdLinea,IdFermata From Corsa_Fermata_Orario) As Id Where Id.IdLinea=S1.Linea and Id.IdFermata=S1.IdFermata) As T1 Where Ritardo.IdCorsa=T1.IdCorsa;

update Ritardo
set Ritardo='00:00:00'
where Ritardo.IdCorsa=IdCorsa;

update Segnalazione
set Elaborato=1
where Id
select sec_to_time(6111.920319999999)

update Segnalazione set Elaborato=1 where IdSegnalazione = 5 OR IdSegnalazione = 6 OR IdSegnalazione = 9 OR IdSegnalazione = 10 OR IdSegnalazione = 13 OR IdSegnalazione = 22 OR IdSegnalazione = 41;
update Ritardo set Ritardo=sec_to_time(6111.910911999999) where Ritardo.IdCorsa=1;
update Ritardo set Ritardo=sec_to_time(-17872.8) where Ritardo.IdCorsa=2;


update Segnalazione set Elaborato=0 where IdSegnalazione = 5 OR IdSegnalazione = 6 OR IdSegnalazione = 9 OR IdSegnalazione = 10 OR IdSegnalazione = 13 OR IdSegnalazione = 22 OR IdSegnalazione = 41;
update Ritardo set Ritardo=sec_to_time(0) where Ritardo.IdCorsa=1;
update Ritardo set Ritardo=sec_to_time(0) where Ritardo.IdCorsa=2;