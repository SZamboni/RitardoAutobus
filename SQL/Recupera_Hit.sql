select UtentiHitId,UserID,WorkerId
from Utente,Utenti_Hit_Id
where Utente.UserID=Utenti_Hit_Id.UserID and DataHit=subdate(current_date, 7);