SELECT IdCorsa 
FROM Corsa
WHERE IdLinea IN (SELECT IdLinea
FROM Corsa
WHERE IdLinea=2);