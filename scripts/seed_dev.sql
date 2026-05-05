-- Testdaten für lokale Entwicklung
-- Ausführen mit: npm run seed:dev

DELETE FROM scans;
DELETE FROM image_likes;

INSERT INTO scans (dog_id, badge_id, ip_hash, ua, source, country, city, scanned_at) VALUES
  -- adesso Badge – verschiedene Länder, letzte 30 Tage
  ('theo', 'adesso', 'hash001', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',        'qr',     'DE', 'Dortmund',  datetime('now', '-1 days')),
  ('theo', 'adesso', 'hash002', 'Mozilla/5.0 (Linux; Android 13)',                  'qr',     'DE', 'Berlin',    datetime('now', '-2 days')),
  ('theo', 'adesso', 'hash003', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',          'qr',     'DE', 'München',   datetime('now', '-3 days')),
  ('theo', 'adesso', 'hash004', 'Mozilla/5.0 (iPhone)',                             'qr',     'DE', 'Hamburg',   datetime('now', '-5 days')),
  ('theo', 'adesso', 'hash005', 'Mozilla/5.0 (Windows NT 10.0)',                    'qr',     'AT', 'Wien',      datetime('now', '-6 days')),
  ('theo', 'adesso', 'hash006', 'Mozilla/5.0 (iPhone)',                             'qr',     'AT', 'Graz',      datetime('now', '-8 days')),
  ('theo', 'adesso', 'hash007', 'Mozilla/5.0 (Linux; Android 14)',                  'qr',     'CH', 'Zürich',    datetime('now', '-9 days')),
  ('theo', 'adesso', 'hash008', 'Mozilla/5.0 (iPhone)',                             'qr',     'NL', 'Amsterdam', datetime('now', '-11 days')),
  ('theo', 'adesso', 'hash009', 'Mozilla/5.0 (Windows NT 10.0)',                    'qr',     'GB', 'London',    datetime('now', '-13 days')),
  ('theo', 'adesso', 'hash010', 'Mozilla/5.0 (Macintosh)',                          'qr',     'US', 'New York',  datetime('now', '-15 days')),

  -- nemetschek Badge
  ('theo', 'nemetschek', 'hash011', 'Mozilla/5.0 (iPhone)',                         'qr',     'DE', 'Frankfurt', datetime('now', '-1 days')),
  ('theo', 'nemetschek', 'hash012', 'Mozilla/5.0 (Linux; Android 13)',              'qr',     'DE', 'Köln',      datetime('now', '-4 days')),
  ('theo', 'nemetschek', 'hash013', 'Mozilla/5.0 (Windows NT 10.0)',                'qr',     'DE', 'Stuttgart', datetime('now', '-7 days')),
  ('theo', 'nemetschek', 'hash014', 'Mozilla/5.0 (iPhone)',                         'qr',     'FR', 'Paris',     datetime('now', '-10 days')),
  ('theo', 'nemetschek', 'hash015', 'Mozilla/5.0 (Macintosh)',                      'qr',     'PL', 'Warszawa',  datetime('now', '-12 days')),
  ('theo', 'nemetschek', 'hash016', 'Mozilla/5.0 (iPhone)',                         'qr',     'IT', 'Milano',    datetime('now', '-14 days')),
  ('theo', 'nemetschek', 'hash017', 'Mozilla/5.0 (Android)',                        'qr',     'ES', 'Madrid',    datetime('now', '-18 days')),
  ('theo', 'nemetschek', 'hash018', 'Mozilla/5.0 (Windows)',                        'qr',     'CH', 'Bern',      datetime('now', '-20 days')),

  -- Direkte Aufrufe (kein Badge)
  ('theo', 'direct', 'hash019', 'Mozilla/5.0 (Macintosh)',                          'direct', 'DE', 'Dortmund',  datetime('now', '-1 days')),
  ('theo', 'direct', 'hash020', 'Mozilla/5.0 (iPhone)',                             'direct', 'DE', 'Berlin',    datetime('now', '-3 days')),
  ('theo', 'direct', 'hash021', 'Mozilla/5.0 (Windows)',                            'direct', 'AT', 'Wien',      datetime('now', '-6 days')),
  ('theo', 'direct', 'hash022', 'Mozilla/5.0 (Linux)',                              'direct', 'US', 'Chicago',   datetime('now', '-16 days')),
  ('theo', 'direct', 'hash023', 'Mozilla/5.0 (iPhone)',                             'direct', 'GB', 'Manchester',datetime('now', '-22 days')),
  ('theo', 'direct', 'hash024', 'Mozilla/5.0 (Android)',                            'direct', 'DE', 'Leipzig',   datetime('now', '-25 days')),
  ('theo', 'direct', 'hash025', 'Mozilla/5.0 (Macintosh)',                          'direct', 'NL', 'Rotterdam', datetime('now', '-28 days'));

INSERT INTO image_likes (image_key, cnt) VALUES
  ('dogs/theo/foto1.jpg', 12),
  ('dogs/theo/foto2.jpg', 7),
  ('dogs/theo/foto3.jpg', 4),
  ('dogs/theo/foto4.jpg', 9);
