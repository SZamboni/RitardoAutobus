Create Procedure Linee_Ritardi(IN IdFerm INT,IN Scarto TIME)

Select Linea.IdLinea,NomeLinea,Orario,Ritardo,T1.IdCorsa
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
T1.IdLinea=Linea.IdLinea;