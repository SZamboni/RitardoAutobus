SET SQL_SAFE_UPDATES = 0;

UPDATE ritardoautobus.Fermata f
INNER JOIN opendata.stops s ON f.IdFermataTT = s.stop_id
SET f.NomeFermata = s.stop_name;
