-- ------------------------------------------------------------------------------------------------
-- Selezione dei campi per popolare le tabelle partendo dai dati estratti da Trentinto Trasporti
-- 
-- CONVENZIONE DELLE DIREZIONI (Fermata e Corsa)
-- 0 = andata
-- 1 = ritorno o non c'è bisogno di distinzione
-- ------------------------------------------------------------------------------------------------

INSERT INTO ritardoautobus.Fermata (IdFermataTT, NomeFermata, Latitudine, Longitudine, Direzione)

select stop_id, stop_name, stop_lat, stop_lon, if(stop_code like '%z',0,1) as direction
from opendata.stops;

-- -----------------------------------------------------------------------------------------------

INSERT INTO ritardoautobus.Linea (IdLineaTT, NomeLinea, NumeroLinea)

select route_id, route_long_name, route_short_name
from opendata.routes;

-- -----------------------------------------------------------------------------------------------

INSERT INTO ritardoautobus.Corsa (IdCorsaTT, IdLinea, Direzione, Capolinea)

select t.trip_id, l.IdLinea, t.direction_id, t.trip_headsign
from opendata.trips t inner join ritardoautobus.Linea l on t.route_id = l.IdLineaTT
where t.service_id in (select service_id
					   from opendata.calendar
					   where monday='1');

-- -----------------------------------------------------------------------------------------------

INSERT INTO ritardoautobus.Linea_Fermata

select l.IdLinea, f.IdFermata
from (((select distinct t.route_id, st.stop_id
		from opendata.stop_times st, opendata.trips t
        where t.trip_id = st.trip_id
        and t.service_id in (select service_id
							 from opendata.calendar
                             where monday='1')
        ) tabella inner join ritardoautobus.Linea l on tabella.route_id = l.IdLineaTT)
		inner join ritardoautobus.Fermata f on tabella.stop_id = f.IdFermataTT);
      
-- ------------------------------------------------------------------------------------------------

INSERT INTO ritardoautobus.Corsa_Fermata_Orario (IdCorsa, IdLinea, Orario, IdFermata)

select c.IdCorsa, c.IdLinea, orari.arrival_time, f.IdFermata
from (((select t.trip_id, t.route_id, st.arrival_time, st.stop_id
		from opendata.stop_times st, opendata.trips t
		where t.trip_id = st.trip_id
        and t.service_id in (select cal.service_id
							 from opendata.calendar cal
                             where cal.monday='1')
		) orari inner join ritardoautobus.Corsa c on orari.trip_id = c.IdCorsaTT)
		inner join ritardoautobus.Fermata f on orari.stop_id = f.IdFermataTT);