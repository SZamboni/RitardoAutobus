Select Linea.IdLinea,NomeLinea,Orario
From
(Select IdLinea,Orario
From Corsa_Fermata_Orario
Where (IdLinea IN (SELECT IdLinea FROM Linea_Fermata WHERE IdFermata=1)) 
And 
(Orario between '16:00:00' and '17:00:00')) As T1, Linea
Where Linea.IdLinea IN (SELECT IdLinea FROM Linea_Fermata WHERE IdFermata=1)
And
T1.IdLinea=Linea.IdLinea;