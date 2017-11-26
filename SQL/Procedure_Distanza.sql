Create Procedure Distanza (IN lat DECIMAL(10,8),IN lng DECIMAL(11,8),IN dist FLOAT)
SELECT (
   6366 *
   acos(cos(radians(lat)) * 
   cos(radians(Latitudine)) * 
   cos(radians(Longitudine) - 
   radians(lng)) + 
   sin(radians(lat)) * 
   sin(radians(Latitudine )))
) AS distance
FROM Fermata 
HAVING distance < dist
ORDER BY distance;
