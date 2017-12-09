Create Procedure Inserisci_Ritardi_Base ()
Insert Into Ritardo (IdCorsa,DataRitardo,Ritardo)
Select IdCorsa,curdate(),'00:00:00'
From Corsa;

Call Inserisci_Ritardi_Base();