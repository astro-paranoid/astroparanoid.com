DROP TABLE IF EXISTS liked;
DROP TABLE IF EXISTS asteroids;
DROP TABLE IF EXISTS daily_max_size;

CREATE TABLE asteroids (
  id SERIAL PRIMARY KEY,
  neo_ref_id NUMERIC(10,0),
  name VARCHAR(255),
  hazardous BOOLEAN NOT NULL,
  miss_distance_miles NUMERIC(20,10),
  diameter_feet_min NUMERIC(20,10),
  diameter_feet_max NUMERIC(20,10),
  velocity_mph NUMERIC(20,10),
  sentry_object BOOLEAN,
  closest_date VARCHAR(20),
  img VARCHAR(255)
);

CREATE TABLE liked (
  id SERIAL PRIMARY KEY,
  asteroid_id INTEGER NOT NULL,
  UNIQUE(asteroid_id),
  FOREIGN KEY (asteroid_id) REFERENCES asteroids (id)
);

CREATE TABLE daily_max_size (
  id SERIAL PRIMARY KEY,
  date VARCHAR(20),
  size NUMERIC (20,10)
);
