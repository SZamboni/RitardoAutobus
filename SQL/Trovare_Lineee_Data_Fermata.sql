SELECT NomeLinea 
FROM Linea 
WHERE IdLinea IN (SELECT IdLinea
FROM Linea_Fermata
WHERE IdFermata=2);