-- 1. Crear Tabla de Categorías
CREATE TABLE categorias (
  id_categoria SERIAL PRIMARY KEY,
  nombre_categoria VARCHAR(100) NOT NULL
);

-- 2. Crear Tabla de Señas (El corazón de tu traductor)
CREATE TABLE senas (
  id SERIAL PRIMARY KEY,
  palabra VARCHAR(100) NOT NULL,
  descripcion TEXT,
  url_drive TEXT,
  id_categoria INTEGER REFERENCES categorias(id_categoria) ON DELETE SET NULL
);

-- 3. Crear Tabla de Usuarios
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre_completo VARCHAR(255),
  correo VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  rol VARCHAR(50) DEFAULT 'alumno',
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crear Tabla de Favoritos
CREATE TABLE favoritos (
  id SERIAL PRIMARY KEY,
  id_usuario INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  id_sena INTEGER REFERENCES senas(id) ON DELETE CASCADE
);

-- OPCIONAL: Insertar algunas categorías de prueba
INSERT INTO categorias (nombre_categoria) VALUES ('Saludos'), ('Alfabeto'), ('Familia');