update Utente
set WorkerId='xxxx'
where UserID=111;

insert into Utenti_Hit(UserID,HitId,HitTypeId,DataHit)
values (11,'ggggdddds','hhhsfdsssf','2017-05-07');

update Utenti_Hit
set UserID=6
where UserID=11;

-- Numero di Hit non visualizzati in base all'UserId
-- Dato l'Id : Tutto
-- Update che mette visualizzato a 1 dato l'Id della tabella
-- Update che setta elaborato a 1 da l'Id

Select count(*)
From Utenti_Hit
Where UserId=1;

Select *
From Utenti_Hit
Where UserId=1;

Update Utenti_Hit
Set Visualizzato=1
Where UtentiHitId=1;

Update Utenti_Hit
Set Elaborato=1
Where Utenti_Hit=1;