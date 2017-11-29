Create Procedure Distanza (IN lat1 DECIMAL(10,8),IN lng1 DECIMAL(11,8),IN lat2 DECIMAL(10,8),IN lng2 DECIMAL(11,8))
SELECT (
   6366 *
   acos(cos(radians(lat1)) * 
   cos(radians(lat2)) * 
   cos(radians(lng2) - 
   radians(lng1)) + 
   sin(radians(lat1)) * 
   sin(radians(lat2)))
) AS distance