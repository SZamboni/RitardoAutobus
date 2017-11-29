Select Linea.IdLinea,NomeLinea,Orario,Ritardo
From
(Select IdLinea,Orario,IdCorsa
From Corsa_Fermata_Orario
Where (IdLinea IN (SELECT IdLinea FROM Linea_Fermata WHERE IdFermata=2)) 
And 
(Orario between '16:00:00' and '17:00:00')) As T1, Linea, Ritardo
Where Linea.IdLinea IN (SELECT IdLinea FROM Linea_Fermata WHERE IdFermata=2)
And 
T1.IdCorsa=Ritardo.IdCorsa
And
Ritardo.DataRitardo = '2017-11-24'
And
T1.IdLinea=Linea.IdLinea;
