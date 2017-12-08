CREATE PROCEDURE `Linee_Ritardi`(IN IdFerm INT,IN Scarto TIME)
select distinct Linea.IdLinea, NomeLinea, Orario, Ritardo, T1.IdCorsa

from (select IdLinea, Orario, IdCorsa
	  from Corsa_Fermata_Orario
	  where IdFermata=IdFerm
	  and 
	  (Orario between Time((Time(addtime(now(),'01:00:00'))))
      and (Time(addtime((Time(addtime(now(),'01:00:00'))),Scarto))))) As T1, Linea, Ritardo
      
where Linea.IdLinea in (select IdLinea 
						from Linea_Fermata
                        where IdFermata=IdFerm)
and
T1.IdCorsa=Ritardo.IdCorsa
and
Ritardo.DataRitardo = Curdate()
and
T1.IdLinea=Linea.IdLinea