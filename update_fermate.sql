SET SQL_SAFE_UPDATES = 0;
-- basta la distinzione fra due fermate con lo stesso nome

UPDATE ritardoautobus.Fermata f
INNER JOIN opendata.stops s ON f.IdFermataTT = s.stop_id
SET f.NomeFermata = CONCAT(f.NomeFermata,  CASE 
										   WHEN s.stop_code LIKE '%z' THEN ' - Andata'
										   WHEN s.stop_code LIKE '%x' THEN ' - Ritorno'
                                           -- WHEN s.stop_code LIKE '%c' THEN ' - Capolinea'
										   ELSE ''
										   END);
