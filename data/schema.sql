DROP TABLE IF EXISTS asteroids;

CREATE TABLE asteroids (
  id SERIAL PRIMARY KEY,
  name VARCHAR(30),
  is_potentially_hazardous_asteroid BOOLEAN NOT NULL,
  miss_distance NUMERIC,
  estimated_diameter_min NUMERIC,
  estimated_diameter_max NUMERIC
);