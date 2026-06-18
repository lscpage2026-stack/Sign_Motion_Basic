# Supabase Setup Instructions

## Row Level Security (RLS) Policies

Ejecuta estos comandos en el SQL Editor de Supabase para habilitar seguridad:

```sql
-- Habilitar RLS en la tabla usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Permiso para insertar (registro)
CREATE POLICY "Permitir registro" ON usuarios FOR INSERT WITH CHECK (true);

-- Permiso para seleccionar por correo (login)
CREATE POLICY "Permitir login" ON usuarios FOR SELECT USING (true);

-- Permiso para actualizar roles (admin)
CREATE POLICY "Permitir actualizar roles" ON usuarios FOR UPDATE USING (true);

-- Habilitar RLS en la tabla senas
ALTER TABLE senas ENABLE ROW LEVEL SECURITY;

-- Permiso para seleccionar senas (lectura publica)
CREATE POLICY "Permitir lectura senas" ON senas FOR SELECT USING (true);

-- Permiso para insertar senas (admin)
CREATE POLICY "Permitir insertar senas" ON senas FOR INSERT WITH CHECK (true);

-- Permiso para eliminar senas (admin)
CREATE POLICY "Permitir eliminar senas" ON senas FOR DELETE USING (true);
```

## Datos de prueba para la tabla senas

```sql
-- Insertar palabras de prueba si usas videos locales
INSERT INTO senas (palabra, url_drive) VALUES 
('hola', 'assets/videos/hola.mp4'),
('gracias', 'assets/videos/gracias.mp4'),
('buenos dias', 'assets/videos/buenos_dias.mp4'),
('buenas tardes', 'assets/videos/buenas_tardes.mp4'),
('buenas noches', 'assets/videos/buenas_noches.mp4'),
('adios', 'assets/videos/chao.mp4'),
('nos vemos', 'assets/videos/nos_vemos.mp4'),
('por favor', 'assets/videos/por_favor.mp4'),
('de nada', 'assets/videos/de_nada.mp4');
```

## Usuario administrador de prueba

```sql
-- Insertar usuario admin de prueba (cambiar password despues)
INSERT INTO usuarios (nombre_completo, correo, password, rol) VALUES 
('Administrador SIGMOTION', 'lscpage2026@gmail.com', 'admin123', 'admin');
```

## Configuracion del bucket de Storage

1. Ve a Storage > Buckets
2. Crea un bucket llamado `videos`
3. Establece permisos de lectura publica para videos