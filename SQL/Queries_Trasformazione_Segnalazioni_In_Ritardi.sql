Select Dataora, S1.Ritardo, IdCorsa, IdSegnalazione
From 
(Select * 
From Segnalazione
Where Elaborato=0 and SegnalazioneValida=1 and Date(curdate())=Date(DataOra)) As S1,
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

Update Segnalazione
set Elaborato=1
where IdSegnalazione=1;

Select distinct Corsa as IdCorsa,Time_to_Sec(Ritardo.Ritardo) As Ritardo
From Segnalazione,Ritardo
Where Elaborato=0 And SegnalazioneValida=1 And Date(DataOra)=Curdate() And Corsa=IdCorsa And DataRitardo=Curdate();

Select Corsa as IdCorsa,Time_to_Sec(Segnalazione.Ritardo) As Ritardo, IdSegnalazione
From Segnalazione
Where Elaborato=0 And SegnalazioneValida=1 And Date(DataOra)=Curdate();