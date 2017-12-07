Create Procedure Linee_Ritardi(IN IdFerm INT,IN Scarto TIME)

Select distinct Linea.IdLinea,NomeLinea,Orario,Ritardo,T1.IdCorsa
From
(Select IdLinea,Orario,IdCorsa
From Corsa_Fermata_Orario
Where (IdLinea IN (SELECT IdLinea FROM Linea_Fermata WHERE IdFermata=IdFerm)) 
And 
(Orario between Time((Time(addtime(now(),'01:00:00')))) and (Time(addtime((Time(addtime(now(),'01:00:00'))),Scarto))))) As T1, Linea, Ritardo
Where Linea.IdLinea IN (SELECT IdLinea FROM Linea_Fermata WHERE IdFermata=IdFerm)
And 
T1.IdCorsa=Ritardo.IdCorsa
And
Ritardo.DataRitardo = Curdate()
And
T1.IdLinea=Linea.IdLinea
Order By Orario,IdCorsa,IdLinea;

Select * From Fermata Where NomeFermata like '%manci%';

Drop Procedure Linee_Ritardi;

Call Linee_Ritardi(10405,'00:10:00');

Select distinct IdLinea,Orario,IdCorsa
From Corsa_Fermata_Orario
Where (IdLinea IN (SELECT IdLinea FROM Linea_Fermata WHERE IdFermata=11))
And 
(Orario between Time((Time(addtime(now(),'01:00:00')))) and (Time(addtime((Time(addtime(now(),'01:00:00'))),'00:04:00'))))
Order by Orario;

Select * From Corsa_Fermata_Orario Where IdCorsa=26805 order by Orario;

Alter Table Utenti_Hit_Id
Add column HitTipeId VARCHAR(100);

Describe Utenti_Hit_Id;