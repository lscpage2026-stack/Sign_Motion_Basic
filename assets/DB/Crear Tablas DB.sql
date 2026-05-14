-- 1. Crear Tabla de Categorías
CREATE TABLE categorias (
  id_categoria SERIAL PRIMARY KEY,
  nombre_categoria VARCHAR(100) NOT NULL
);

-- 2. Crear Tabla de Señas (El corazón de tu traductor)
CREATE TABLE senas (
  id_sena SERIAL PRIMARY KEY,
  palabra VARCHAR(100) NOT NULL,
  descripcion TEXT,
  url_drive TEXT, -- Aquí pondrás los links directos de Drive
  id_categoria INTEGER REFERENCES categorias(id_categoria) ON DELETE SET NULL
);

-- 3. Crear Tabla de Usuarios
CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre_completo VARCHAR(255),
  correo VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL, -- Recuerda que en producción esto se encripta
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Crear Tabla de Favoritos
CREATE TABLE favoritos (
  id_favorito SERIAL PRIMARY KEY,
  id_usuario INTEGER REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  id_sena INTEGER REFERENCES senas(id_sena) ON DELETE CASCADE
);

-- OPCIONAL: Insertar algunas categorías de prueba
INSERT INTO categorias (nombre_categoria) VALUES ('Saludos'), ('Alfabeto'), ('Familia');