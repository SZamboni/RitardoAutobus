SELECT 
(
   6366 *
   acos(cos(radians(46.0673507)) * 
   cos(radians(Latitudine)) * 
   cos(radians(Longitudine) - 
   radians(11.162978)) + 
   sin(radians(46.0673507)) * 
   sin(radians(Latitudine )))
) AS distance 
FROM Fermata 
HAVING distance < 0.2
ORDER BY distance;