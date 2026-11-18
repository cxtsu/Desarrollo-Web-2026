-- =========================================================================
-- ARCHIVO: datos.sql
-- DESCRIPCIÓN: Estructura de base de datos relacional y carga inicial de
--              álbumes de BTS para la Evaluación Proyecto Web con acceso DB.
-- =========================================================================

CREATE DATABASE IF NOT EXISTS bts_discografia
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bts_discografia;

-- Limpieza previa en caso de re-ejecución
DROP TABLE IF EXISTS albumes;
DROP TABLE IF EXISTS eras_conceptuales;

-- -------------------------------------------------------------------------
-- TABLA 1: eras_conceptuales (Tabla maestra / padre)
-- -------------------------------------------------------------------------
CREATE TABLE eras_conceptuales (
    era_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_era VARCHAR(100) NOT NULL,
    descripcion_era VARCHAR(255) NOT NULL
);

-- -------------------------------------------------------------------------
-- TABLA 2: albumes (Tabla detalle / hija con clave foránea hacia eras)
-- -------------------------------------------------------------------------
CREATE TABLE albumes (
    album_id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(120) NOT NULL,
    anio_lanzamiento INT NOT NULL,
    cancion_principal VARCHAR(120) NOT NULL,
    tipo_lanzamiento VARCHAR(60) NOT NULL,
    precio_clp DECIMAL(10, 0) NOT NULL,
    descripcion TEXT NOT NULL,
    color_acento VARCHAR(20) NOT NULL,
    era_id INT NOT NULL,
    CONSTRAINT fk_album_era
        FOREIGN KEY (era_id)
        REFERENCES eras_conceptuales (era_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

-- -------------------------------------------------------------------------
-- INSERCIÓN DE ERAS CONCEPTUALES
-- -------------------------------------------------------------------------
INSERT INTO eras_conceptuales (nombre_era, descripcion_era) VALUES
('The Most Beautiful Moment in Life (HYYH)', 'Trilogía centrada en la juventud, la transición a la adultez y la belleza efímera.'),
('WINGS & You Never Walk Alone', 'Concepto inspirado en Demian de Hermann Hesse, explorando la tentación y el crecimiento.'),
('Love Yourself Trilogy', 'Serie enfocada en las etapas del amor propio: Wonder, Her, Tear y Answer.'),
('Map of the Soul', 'Exploración de la psicología junguiana: Persona, Shadow y Ego.'),
('Anthology & Modern Era', 'Compilación histórica y reflexión sobre la pandemia y el futuro del grupo.');

-- -------------------------------------------------------------------------
-- INSERCIÓN DE ÁLBUMES DE BTS
-- -------------------------------------------------------------------------
INSERT INTO albumes (titulo, anio_lanzamiento, cancion_principal, tipo_lanzamiento, precio_clp, descripcion, color_acento, era_id) VALUES
(
    'The Most Beautiful Moment in Life, Pt. 1',
    2015,
    'I NEED U',
    'Mini Álbum (EP)',
    24990,
    'Tercer mini álbum que marcó un giro sonoro hacia el pop emocional y obtuvo su primera victoria en programas musicales.',
    '#f4a2b8',
    1
),
(
    'The Most Beautiful Moment in Life: Young Forever',
    2016,
    'FIRE / Save ME',
    'Álbum Especial',
    32990,
    'Álbum recopilatorio que cierra la saga HYYH celebrando la juventud eterna a pesar de la incertidumbre.',
    '#7ec8e3',
    1
),
(
    'WINGS',
    2016,
    'Blood Sweat & Tears',
    'Álbum de Estudio',
    27990,
    'Segundo álbum de estudio coreano que incluye canciones en solitario para cada uno de los siete integrantes.',
    '#2c2c34',
    2
),
(
    'You Never Walk Alone',
    2017,
    'Spring Day',
    'Álbum Repackage',
    29990,
    'Extensión de WINGS con mensajes de consuelo y esperanza, destacando el himno atemporal Spring Day.',
    '#7bdcb5',
    2
),
(
    'Love Yourself 承 ''Her''',
    2017,
    'DNA',
    'Mini Álbum (EP)',
    25990,
    'Inicio de la serie Love Yourself, explorando la emoción y el deslumbramiento del primer enamoramiento.',
    '#f7b2d9',
    3
),
(
    'Love Yourself 轉 ''Tear''',
    2018,
    'FAKE LOVE',
    'Álbum de Estudio',
    28990,
    'Primer álbum de un artista coreano en alcanzar el puesto #1 en el listado Billboard 200 de Estados Unidos.',
    '#3d348b',
    3
),
(
    'Love Yourself 結 ''Answer''',
    2018,
    'IDOL',
    'Álbum Recopilatorio',
    34990,
    'Conclusión de la narrativa Love Yourself, afirmando que amarse a uno mismo es el verdadero comienzo.',
    '#b5838d',
    3
),
(
    'Map of the Soul: 7',
    2020,
    'ON / Black Swan',
    'Álbum de Estudio',
    36990,
    'Obra introspectiva que conmemora los siete años de carrera junto a los siete miembros del grupo.',
    '#5e60ce',
    4
),
(
    'BE (Deluxe Edition)',
    2020,
    'Life Goes On / Dynamite',
    'Álbum de Estudio',
    39990,
    'Álbum producido directamente por los integrantes durante el aislamiento global para transmitir cercanía.',
    '#6d6875',
    5
),
(
    'Proof',
    2022,
    'Yet To Come (The Most Beautiful Moment)',
    'Álbum Antología',
    45990,
    'Antología de tres discos que repasa nueve años de trayectoria musical, demos inéditos y canciones elegidas por los miembros.',
    '#1d1e22',
    5
);

-- Consulta de verificación con INNER JOIN
SELECT
    a.album_id,
    a.titulo,
    a.anio_lanzamiento,
    a.cancion_principal,
    a.tipo_lanzamiento,
    a.precio_clp,
    a.descripcion,
    a.color_acento,
    e.nombre_era AS era
FROM albumes AS a
INNER JOIN eras_conceptuales AS e
    ON a.era_id = e.era_id
ORDER BY a.anio_lanzamiento ASC, a.album_id ASC;