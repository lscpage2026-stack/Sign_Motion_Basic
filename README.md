# SIGMOTION BASIC

## Traductor de Lengua de Señas

**SIGMOTION Basic** es una aplicación web diseñada para facilitar la comunicación mediante lengua de señas. Permite a los usuarios buscar palabras y visualizar videos con la seña correspondiente, además de contar con un panel de administración para gestionar el contenido.

---

## Descripción General

SIGMOTION Basic es una aplicación educativa y de apoyo a la comunicación que permite:

- **Registro e inicio de sesión** de usuarios mediante correo electrónico y contraseña.
- **Traducción de palabras** a lengua de señas mediante videos ilustrativos.
- **Panel de administración** para agregar nuevas señas y gestionar usuarios.
- Interfaz amigable, responsiva y con diseño moderno.

### Páginas de la Aplicación

| Página | Descripción |
|--------|-------------|
| `index.html` | Página de inicio de sesión (Login) |
| `registro.html` | Formulario de registro de nuevos usuarios |
| `app.html` | Aplicación principal (traductor de señas) |
| `admin_sigmotion_hidden.html` | Panel de administración oculto |

---

## Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura de las páginas
- **CSS3** - Estilos y diseño responsivo
- **JavaScript (Vanilla)** - Lógica del cliente, sin frameworks
- **Bootstrap 5.3.0** - Framework CSS para diseño responsivo y componentes UI
- **Google Fonts (Inter)** - Tipografía

### Backend / Servicios
- **Supabase** - Plataforma BaaS (Backend as a Service)
  - Base de datos PostgreSQL
  - Autenticación de usuarios
  - Storage para archivos de video

---

## Estructura del Proyecto

```
SIGMOTION_Basic/
├── index.html                  # Página de login
├── registro.html               # Página de registro
├── app.html                    # Aplicación principal (traductor)
├── admin_sigmotion_hidden.html # Panel de administración
├── css/
│   ├── style.css               # Estilos de la aplicación principal
│   ├── login-style.css         # Estilos de login y registro
│   └── admin_style.css         # Estilos del panel de administración
├── js/
│   ├── config.js               # Configuración de Supabase (API keys)
│   ├── conexion.js             # Inicialización del cliente Supabase
│   ├── login.js                # Lógica de inicio de sesión
│   ├── registro.js             # Lógica de registro de usuarios
│   ├── app.js                  # Lógica del traductor (búsqueda de señas)
│   └── admin.js                # Lógica del panel de administración
├── assets/
│   ├── imagenes/               # Imágenes
│   │   └── panda.png
│   ├── videos/                 # Videos de señas del diccionario
│   │   ├── hola.mp4
│   │   ├── gracias.mp4
│   │   ├── buenos_dias.mp4
│   │   └── ... (+40 archivos de video)
│   └── DB/
│       ├── Crear Tablas DB.sql # Script de creación de la base de datos
│       └── Sigmotion Basic_MER.png # Diagrama MER
└── .gitignore                  # Archivos ignorados por Git
```

---

## Instalación y Configuración

### Requisitos Previos
- Un navegador web moderno (Chrome, Firefox, Edge, Safari)
- Acceso a una cuenta de [Supabase](https://supabase.com)

### Pasos de Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/lscpage2026-stack/Sign_Motion_Basic.git
   cd Sign_Motion_Basic
   ```

2. **Configurar Supabase:**
   - Crear un proyecto en [Supabase](https://app.supabase.com)
   - Crear las tablas `usuarios` y `senas` usando el script SQL en `assets/DB/Crear Tablas DB.sql`
   - Crear un bucket de Storage llamado `videos`
   - Copiar la URL y la clave pública de Supabase

3. **Configurar las credenciales:**
   - Editar el archivo `js/config.js` con las credenciales de tu proyecto de Supabase:
   ```javascript
const CONFIG = {
    SUPABASE_URL: 'https://tu-proyecto.supabase.co',
    SUPABASE_KEY: 'sb_publishable_TuClaveAqui'
};
   ```
   - **Importante:** Este archivo está en `.gitignore` para no exponer las credenciales.

4. **Abrir la aplicación:**
    - Simplemente abrir el archivo `index.html` en un navegador web, o usar un servidor local.

---

## Deploy en Vercel

### Configuración de Variables de Entorno

1. En el dashboard de Vercel, ve a **Settings > Environment Variables**
2. Agrega estas variables:

| Nombre | Valor | Tipo |
|--------|-------|------|
| `SUPABASE_URL` | URL de tu proyecto (ej: `https://abc123.supabase.co`) | Plaintext |
| `SUPABASE_KEY` | Clave pública (publishable key) de Supabase | Plaintext |

### Pasos de Deploy

1. Conecta tu repositorio GitHub a Vercel
2. Configura las variables de entorno
3. Vercel ejecutará `node inject-env.js` durante el build
4. El `js/config.js` se generará automáticamente con las credenciales

---

## Uso de la Aplicación

### Como Usuario

1. **Registrarse:**
   - Ir a `registro.html`
   - Completar nombre completo, correo electrónico, contraseña y confirmación de contraseña
   - Hacer clic en "Crear Cuenta"

2. **Iniciar sesión:**
   - Ir a `index.html`
   - Ingresar correo y contraseña
   - Hacer clic en "Ingresar"

3. **Traducir una palabra:**
   - Escribir una palabra en el campo de texto (ej: "hola", "gracias")
   - Hacer clic en el botón "Traducir" o presionar Enter
   - El video con la seña correspondiente se mostrará en el área de video

4. **Cerrar sesión:**
   - Hacer clic en el botón "Cerrar Sesión" en la barra superior

### Como Administrador

1. **Acceder al panel:**
   - Iniciar sesión con el correo `lscpage2026@gmail.com`
   - Navegar a `admin_sigmotion_hidden.html`

2. **Agregar una nueva seña:**
   - Ir a la pestaña "Nueva Seña"
   - Ingresar la palabra identificadora
   - Subir un archivo de video (arrastrando o seleccionando)
   - Hacer clic en "Subir al Storage y Guardar"

3. **Gestionar usuarios:**
   - Ir a la pestaña "Gestionar Usuarios"
   - Ver lista de usuarios con su rol actual
   - Cambiar rol de usuario (Admin / Alumno)
   - Eliminar usuarios si es necesario

---

## Arquitectura del Sistema

### Flujo de Autenticación
```
Usuario -> index.html -> login.js -> Supabase Auth -> app.html
                                                    |
                                              localStorage (nombre, email)
```

### Flujo de Traducción
```
Usuario ingresa palabra -> app.js -> Query Supabase (tabla: senas)
    |
    v
Si existe -> Mostrar video desde URL de Supabase Storage
Si no existe -> Mostrar mensaje de error
```

### Flujo de Administración
```
Admin -> admin_sigmotion_hidden.html -> admin.js
    |
    v
Upload video a Supabase Storage (bucket: 'videos')
    |
    v
Insert registro en tabla 'senas' (palabra + URL del video)
```

### Comunicación con Supabase

| Operación | Tabla | Método |
|-----------|-------|--------|
| Login | `usuarios` | select + eq |
| Registro | `usuarios` | insert |
| Buscar seña | `senas` | select + eq |
| Agregar seña | `senas` | insert |
| Listar usuarios | `usuarios` | select |
| Cambiar rol | `usuarios` | update |
| Eliminar usuario | `usuarios` | delete |
| Eliminar seña | `senas` | delete |

---

## Base de Datos

### Tabla: `usuarios`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID/serial | Identificador único (auto-generado) |
| `nombre_completo` | text | Nombre completo del usuario |
| `correo` | text | Correo electrónico (único) |
| `password` | text | Contraseña del usuario |
| `rol` | text | Rol del usuario (`admin` o `alumno`) |

### Tabla: `senas`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID/serial | Identificador único (auto-generado) |
| `palabra` | text | Palabra identificadora de la seña |
| `url_drive` | text | URL pública del video en Supabase Storage |

---

## Seguridad

**Notas importantes sobre seguridad:**

1. Las contraseñas se almacenan en texto plano en la base de datos (debe corregirse con hashing).
2. La clave de Supabase está expuesta del lado del cliente (es una publishable key).
3. La validación de administrador se hace solo comparando el email del `localStorage` con un valor hardcodeado.
4. El archivo `js/config.js` está en `.gitignore` para evitar exponer credenciales.

---

## Autores

Proyecto desarrollado por el grupo **LSCPage 2026 Stack** como parte del trabajo de grado.

---

## Licencia

Este proyecto se proporciona con fines educativos.