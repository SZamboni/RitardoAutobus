-- Dato Id Fermata, Linea, Corsa e orario attuale calcolare il ritardo
Select Timediff(Time(addtime(now(),'01:00:00')),Orario) As Ritardo
From Corsa_Fermata_Orario
Where IdFermata=1 and IdLinea=1 and IdCorsa=1;