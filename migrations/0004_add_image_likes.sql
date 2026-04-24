-- Speichert Like-Zähler pro Bild-Key (R2-Pfad, z.B. dogs/theo/foto.jpg)
CREATE TABLE IF NOT EXISTS image_likes (
  image_key TEXT    PRIMARY KEY,
  cnt       INTEGER NOT NULL DEFAULT 0
);
