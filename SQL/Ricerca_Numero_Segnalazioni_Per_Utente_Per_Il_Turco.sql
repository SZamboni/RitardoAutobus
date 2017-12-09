Select Count(*) As NumeroSegnalazioni, IdSegnalatore, QualificationTypeId, Nome, Cognome
From Segnalazione,Utente
Where IdSegnalatore=UserID and Month(Date(DataOra))=Month(subdate(current_date, 1)) and Year(Date(DataOra))=Year(subdate(current_date, 1))
Group by IdSegnalatore;

