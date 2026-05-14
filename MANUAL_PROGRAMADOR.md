# Manual del Programador - SIGMOTION BASIC

## Guia Tecnica de Desarrollo y Mantenimiento

---

## 1. Informacion del Proyecto

| Campo | Detalle |
|-------|---------|
| **Nombre** | SIGMOTION BASIC |
| **Tipo** | Aplicacion Web (SPA estatica) |
| **Stack Tecnologico** | HTML5, CSS3, JavaScript Vanilla, Bootstrap 5.3.0 |
| **Backend** | Supabase (PostgreSQL, Auth, Storage) |
| **Repositorio** | https://github.com/lscpage2026-stack/Sign_Motion_Basic.git |
| **Proposito** | Traductor de lengua de senas con panel de administracion |

---

## 2. Arquitectura de la Aplicacion

### 2.1 Vision General

La aplicacion sigue una arquitectura **cliente unico (SPA)** estatica:

```
┌─────────────────────────────────────────────┐
│              CLIENTE (Navegador)            │
│  ┌───────────────────────────────────────┐  │
│  │  HTML (4 paginas)                     │  │
│  │  ├── index.html (Login)               │  │
│  │  ├── registro.html (Registro)         │  │
│  │  ├── app.html (Traductor)             │  │
│  │  └── admin_sigmotion_hidden.html      │  │
│  │         (Admin)                       │  │
│  ├───────────────────────────────────────┤  │
│  │  CSS (3 hojas de estilo)              │  │
│  │  ├── css/style.css                    │  │
│  │  ├── css/login-style.css              │  │
│  │  └── css/admin_style.css              │  │
│  ├───────────────────────────────────────┤  │
│  │  JavaScript (6 modulos)               │  │
│  │  ├── js/config.js                     │  │
│  │  ├── js/conexion.js                   │  │
│  │  ├── js/login.js                      │  │
│  │  ├── js/registro.js                   │  │
│  │  ├── js/app.js                        │  │
│  │  └── js/admin.js                      │  │
│  └───────────────────────────────────────┘  │
│           ↓                                  │
│  ┌───────────────────────────────────────┐  │
│  │  SERVICIOS EXTERNOS                   │  │
│  │  ├── Supabase (DB + Auth + Storage)  │  │
│  │  ├── Bootstrap CDN                    │  │
│  │  ├── Google Fonts CDN                 │  │
│  │  └── Supabase JS Client Library       │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 2.2 Flujo de Navegacion

```
index.html (Login)
    ├── Login exitoso -> app.html (Traductor)
    │       ├── Traducir palabra -> Video
    │       └── Logout -> index.html
    └── "No tienes cuenta?" -> registro.html (Registro)
            ├── Registro exitoso -> index.html (Login)
            └── "Ya tienes cuenta?" -> index.html (Login)

app.html -> Admin link manual -> admin_sigmotion_hidden.html
            ├── "Volver a la Aplicacion" -> app.html
            ├── Agregar sena -> Supabase Storage + DB
            └── Gestionar usuarios -> CRUD de usuarios
```

---

## 3. Descripcion Detallada de Modulos

### 3.1 js/config.js - Configuracion de Supabase

**Ubicacion:** `js/config.js`
**Proposito:** Almacena las credenciales de conexion a Supabase.

```javascript
const CONFIG = {
    SUPABASE_URL: 'https://zvqsylxhwwunlwnogewu.supabase.co',
    SUPABASE_KEY: 'sb_publishable_YzCZIGsWVF4xXbfRkmtnRg_3hW69iaz'
};
```

**Nota de Seguridad:** Este archivo esta en `.gitignore`. Al clonar el repositorio, es necesario crearlo manualmente con las propias credenciales de Supabase.

---

### 3.2 js/conexion.js - Cliente Supabase

**Ubicacion:** `js/conexion.js`
**Proposito:** Inicializa el cliente global de Supabase utilizado por todos los modulos.

```javascript
const _supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
```

**Dependencias:** `js/config.js`, `@supabase/supabase-js` (via CDN).
**Variable global creada:** `_supabase` - instancia del cliente Supabase.

---

### 3.3 js/login.js - Modulo de Inicio de Sesion

**Ubicacion:** `js/login.js`
**Asociado a:** `index.html`
**Proposito:** Gestiona la autenticacion de usuarios.

**Flujo:**
1. El usuario hace clic en "Ingresar" o presiona Enter.
2. Se valida que los campos de correo y contrasena no esten vacios.
3. Se consulta la tabla `usuarios` en Supabase filtrando por `correo` y `password`.
4. Si se encuentra coincidencia:
   - Se guardan `nombre_completo` y `correo` en `localStorage`.
   - Se redirige a `app.html`.
5. Si no se encuentra coincidencia, se muestra un mensaje de error.

**Funciones principales:**

| Funcion | Parametros | Retorno | Descripcion |
|---------|-----------|---------|-------------|
| `iniciarSesion()` | Ninguno | void | Valida campos, consulta BD, redirige o muestra error |

**Elementos DOM utilizados:**
- `btnLogin` - boton de ingreso
- `logEmail` - campo de correo
- `logPass` - campo de contrasena
- `errorLogin` - contenedor de mensaje de error

**Almacenamiento local establecido:**
- `usuarioNombre` - nombre completo del usuario
- `usuarioEmail` - correo electronico del usuario

---

### 3.4 js/registro.js - Modulo de Registro

**Ubicacion:** `js/registro.js`
**Asociado a:** `registro.html`
**Proposito:** Permite crear nuevas cuentas de usuario.

**Flujo:**
1. El usuario completa el formulario y hace clic en "Crear Cuenta".
2. Se validan los campos:
   - Todos los campos obligatorios deben estar completos.
   - Las contrasenas deben coincidir.
   - El correo debe tener un formato valido (regex).
3. Se inserta un nuevo registro en la tabla `usuarios` de Supabase.
4. Si el correo ya existe (error `23505`), se muestra un mensaje indicando que ya esta registrado.
5. Si el registro es exitoso, se redirige a `index.html`.

**Funciones principales:**

| Funcion | Parametros | Retorno | Descripcion |
|---------|-----------|---------|-------------|
| `validarYRegistrar()` | Ninguno | void | Valida datos de formulario e inserta en BD |
| `mostrarError(mensaje)` | `mensaje: string` | void | Muestra mensaje de error en el DOM |

**Elementos DOM utilizados:**
- `btnRegistrar` - boton de registro
- `regNombre`, `regEmail`, `regPass`, `regPassConfirm` - campos del formulario
- `errorRegistro` - contenedor de mensajes de error
- `registroForm` - formulario HTML

**Nota:** El campo `rol` se asigna automaticamente como `'alumno'` en Supabase (trigger o valor por defecto de la tabla).

---

### 3.5 js/app.js - Modulo Principal (Traductor)

**Ubicacion:** `js/app.js`
**Asociado a:** `app.html`
**Proposito:** Permite buscar palabras y ver la sena correspondiente en video.

**Flujo:**
1. Al cargar la pagina, se verifica si existe sesion en `localStorage`. Si no, redirige a `index.html`.
2. Muestra el nombre del usuario en la barra superior.
3. El usuario ingresa una palabra y hace clic en "Traducir" o presiona Enter.
4. Se consulta la tabla `senas` en Supabase filtrando por `palabra`.
5. Si se encuentra:
   - Se carga el video desde `url_drive` en el reproductor.
   - Se reproduce automaticamente.
6. Si no se encuentra, se muestra un mensaje de error.
7. El boton "Cerrar Sesion" limpia `localStorage` y redirige al login.

**Funciones principales:**

| Funcion | Parametros | Retorno | Descripcion |
|---------|-----------|---------|-------------|
| `traducirSena()` | Ninguno | void | Busca palabra en BD y muestra video |
| Logout (listener) | Ninguno | void | Cierra sesion y limpia localStorage |

**Elementos DOM utilizados:**
- `user-name` - etiqueta de saludo
- `btnBuscar` - boton de busqueda
- `userInput` - campo de texto para la palabra
- `v-player` - elemento `<video>`
- `v-source` - elemento `<source>` del video
- `v-placeholder` - marcador de posicion (cuando no hay video)
- `errorMsg` - mensaje de error
- `btnLogout` - boton de cerrar sesion

---

### 3.6 js/admin.js - Modulo de Administracion

**Ubicacion:** `js/admin.js`
**Asociado a:** `admin_sigmotion_hidden.html`
**Proposito:** Permite al administrador gestionar senas y usuarios.

**Seguridad:**
- Al cargar, verifica que el correo en `localStorage` sea `lscpage2026@gmail.com`.
- Si no es el administrador autorizado, muestra alerta y redirige a `app.html`.

**Funcionalidades:**

#### A) Gestion de Senas
1. **Drag & Drop** o clic para seleccionar archivo de video.
2. Al enviar el formulario:
   - Sube el video al bucket `videos` de Supabase Storage con nombre basado en timestamp.
   - Obtiene la URL publica del video.
   - Inserta un registro en la tabla `senas` con `palabra` y `url_drive`.
3. Muestra lista de senas registradas en una tabla.
4. Permite eliminar senas.

#### B) Gestion de Usuarios
1. Lista todos los usuarios de la tabla `usuarios`.
2. Permite cambiar rol entre `admin` y `alumno`.
3. Permite eliminar usuarios.

**Funciones principales:**

| Funcion | Parametros | Retorno | Descripcion |
|---------|-----------|---------|-------------|
| `confirmarArchivo(file)` | `file: File` | void | Confirma archivo seleccionado para upload |
| `cargarUsuarios()` | Ninguno | void | Carga y muestra la lista de usuarios |
| `cambiarRol(correo, rol)` | `correo: string`, `rol: string` | void | Cambia el rol de un usuario |
| `eliminarUsuario(correo)` | `correo: string` | void | Elimina un usuario |
| `cargarListadoSenas()` | Ninguno | void | Carga la lista de senas en la tabla |
| `eliminarSena(id, url)` | `id: number`, `url: string` | void | Elimina una seña |
| `mostrarEstado(mensaje, clase)` | `mensaje: string`, `clase: string` | void | Muestra alerta de estado |

**BUG CONOCIDO:** Existe una funcion `eliminarUsuario` duplicada (una acepta `correo` y otra `id`). La segunda sobreescribe la primera mediante `window.eliminarUsuario`. Debe corregirse eliminando la version duplicada.

---

## 4. Hojas de Estilo (CSS)

### 4.1 css/login-style.css
**Asociado a:** `index.html`, `registro.html`
- Variables de color en tonos pasteles (mint, rosa)
- Diseno centrado con fondo de imagen
- Estilos para la tarjeta de login, inputs, botones y mensajes de error
- Responsive: en pantallas pequenas se apilan los elementos

### 4.2 css/style.css
**Asociado a:** `app.html`
- Estilos para la barra superior con efecto glassmorphism
- Diseno del area de video con borde punteado
- Estilos del diccionario lateral
- Responsive: la barra superior se apila en movil

### 4.3 css/admin_style.css
**Asociado a:** `admin_sigmotion_hidden.html`
- Estilos para la tarjeta de administracion
- Diseno de pestanas (pills) con colores de marca
- Zona de drag & drop con estados visuales
- Tablas de usuarios con badges de rol
- Estilos para botones de accion

---

## 5. Base de Datos Supabase

### 5.1 Tabla: `usuarios`

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `id` | uuid/serial | PK, auto-generado por Supabase |
| `nombre_completo` | text | Nombre completo del usuario |
| `correo` | text | Correo electronico (unico) |
| `password` | text | Contrasena del usuario (sin hash actualmente) |
| `rol` | text | Rol: `admin` o `alumno` |

### 5.2 Tabla: `senas`

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `id` | uuid/serial | PK, auto-generado por Supabase |
| `palabra` | text | Palabra identificadora de la sena |
| `url_drive` | text | URL publica del video en Supabase Storage |

### 5.3 Storage: `videos`
- Bucket de Supabase Storage donde se almacenan los archivos `.mp4` de las senas.
- Los archivos se nombran como: `<timestamp>_<nombre_original>`.
- Se obtiene URL publica para reproduccion en la aplicacion.

---

## 6. Instrucciones para Desarrolladores

### 6.1 Primeros Pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/lscpage2026-stack/Sign_Motion_Basic.git
cd Sign_Motion_Basic

# 2. Abrir en el navegador
# Opcion A: Abrir index.html directamente
# Opcion B: Usar un servidor local
npx serve .
# o
python -m http.server 8080
```

### 6.2 Configuracion de Supabase

1. Ir a [app.supabase.com](https://app.supabase.com) y crear un proyecto.
2. En el SQL Editor, ejecutar el script de `assets/DB/Crear Tablas DB.sql`.
3. Crear un bucket de Storage llamado `videos` (permiso publico).
4. Editar el RL (Row Level Security) de las tablas segun sea necesario.
5. Copiar la URL y clave publica en `js/config.js`.

### 6.3 Registro de una nueva sena

1. Iniciar sesion como administrador (correo: `lscpage2026@gmail.com`).
2. Navegar a `admin_sigmotion_hidden.html`.
3. Ir a la pestana "Nueva Sena".
4. Ingresar la palabra (ej: "abrazar").
5. Subir el archivo de video (.mp4).
6. Hacer clic en "Subir al Storage y Guardar".
7. La sena estara disponible inmediatamente en la aplicacion principal.

---

## 7. Mejoras Pendientes

| # | Mejora | Prioridad | Estado |
|---|--------|-----------|--------|
| 1 | Hashear contrasenas (bcrypt) antes de almacenar | Alta | Pendiente |
| 2 | Implementar refresh token para sesiones | Media | Pendiente |
| 3 | Corregir funcion `eliminarUsuario` duplicada en `admin.js` | Alta | Pendiente |
| 4 | Agregar validacion de roles en el backend (RLS de Supabase) | Alta | Pendiente |
| 5 | Mejorar accesibilidad (ARIA labels, navegacion por teclado) | Media | Pendiente |
| 6 | Agregar paginacion o busqueda en diccionario | Baja | Pendiente |
| 7 | Optimizar videos (carga lazy, compresion) | Media | Pendiente |
| 8 | Implementar recuperacion de contrasena | Media | Pendiente |

---

## 8. Resolucion de Problemas Comunes

| Problema | Causa Probable | Solucion |
|----------|---------------|----------|
| Login no funciona | Credenciales incorrectas o tabla `usuarios` no existe | Verificar datos en Supabase |
| Videos no cargan | URL de `url_drive` incorrecta o bucket privado | Verificar URL publica en Storage |
| Registro falla | Error de duplicidad de correo (`23505`) | Usar otro correo |
| Admin no accede | Email en localStorage no coincide | Cerrar sesion y volver a ingresar |
| Errores de CORS | URL de Supabase incorrecta | Verificar `js/config.js` |

---

## 9. Historial de Versiones

| Version | Fecha | Descripcion |
|---------|-------|-------------|
| 1.0.0 | Mayo 2026 | Version inicial - Login, registro, traductor basico y panel admin |
| 1.0.1 | Mayo 2026 | Agregada documentacion README.md y Manual del Programador |