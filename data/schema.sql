DROP TABLE IF EXISTS asteroids;

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
  closest_date VARCHAR(255)
);