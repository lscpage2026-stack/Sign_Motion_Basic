# Manual de Usuario — SIGMOTION BASIC

## Guía para el Uso de la Aplicación

---

## Bienvenido

¡Bienvenido a **SIGMOTION BASIC**! Esta aplicación ha sido diseñada para ayudarte a aprender y consultar la lengua de señas de forma sencilla e interactiva. A través de videos ilustrativos, podrás buscar palabras y visualizar su traducción a señas.

Este manual te guiará paso a paso en el uso de todas las funciones disponibles.

---

## Tabla de Contenidos

1. [Requisitos del Sistema](#1-requisitos-del-sistema)
2. [Cómo Acceder a la Aplicación](#2-cómo-acceder-a-la-aplicación)
3. [Registrarse en la Plataforma](#3-registrarse-en-la-plataforma)
4. [Iniciar Sesión](#4-iniciar-sesión)
5. [La Pantalla Principal (Traductor)](#5-la-pantalla-principal-traductor)
6. [Cómo Traducir una Palabra](#6-cómo-traducir-una-palabra)
7. [El Diccionario](#7-el-diccionario)
8. [Cerrar Sesión](#8-cerrar-sesión)
9. [Panel de Administración](#9-panel-de-administración)
10. [Preguntas Frecuentes](#10-preguntas-frecuentes)

---

## 1. Requisitos del Sistema

Para utilizar SIGMOTION BASIC necesitas:

- **Dispositivo:** Computador, tablet o smartphone
- **Navegador web:** Google Chrome, Mozilla Firefox, Microsoft Edge o Safari (versiones recientes)
- **Conexión a internet:** Estable y activa
- **Cuenta de usuario:** Regístrate si aún no tienes una

**No es necesario instalar ningún software adicional.** La aplicación funciona directamente en el navegador.

---

## 2. Cómo Acceder a la Aplicación

1. Abre tu navegador web preferido.
2. Ingresa la siguiente dirección (o la que te haya proporcionado tu institución):
   ```
   https://tu-servidor.com/index.html
   ```
3. Verás la pantalla de **Inicio de Sesión** con el logo de SIGMOTION y un panda saludando.

**Si es tu primera vez**, haz clic en el enlace **"Regístrate"** que aparece en la parte inferior del formulario de login.

---

## 3. Registrarse en la Plataforma

### Paso a Paso:

1. Haz clic en **"Regístrate"** desde la pantalla de login, o accede directamente a `registro.html`.
2. Verás el formulario de registro con los siguientes campos:

   | Campo | Descripción | Ejemplo |
   |-------|-------------|---------|
   | **Nombre completo** | Tu nombre y apellidos | Juan Pérez García |
   | **Correo electrónico** | Un email válido y activo | juan.perez@email.com |
   | **Contraseña** | Mínimo 6 caracteres | MiClave123 |
   | **Confirmar contraseña** | Repite la contraseña | MiClave123 |

3. Completa todos los campos correctamente.
4. Haz clic en el botón **"Crear Cuenta"**.

### Reglas de Validación:
- ✅ Todos los campos son obligatorios
- ✅ Las contraseñas deben coincidir
- ✅ El correo debe tener un formato válido (contiene @ y un dominio)
- ✅ Si el correo ya está registrado, aparecerá un mensaje de error

### Resultado:
- Recibirás una alerta confirmando que tu cuenta fue creada exitosamente.
- Serás redirigido automáticamente a la pantalla de **Inicio de Sesión**.
- Tu rol inicial será **"Alumno"**, lo que te permite usar el traductor.

---

## 4. Iniciar Sesión

### Paso a Paso:

1. En la pantalla principal (`index.html`), verás el formulario de login.
2. Ingresa tus credenciales:

   | Campo | Descripción |
   |-------|-------------|
   | **Correo electrónico** | El email con el que te registraste |
   | **Contraseña** | La contraseña que elegiste |

3. Haz clic en el botón **"Ingresar"** o presiona la tecla **Enter**.

### Posibles Mensajes de Error:

| Mensaje | Significado | Solución |
|---------|-------------|----------|
| "Por favor, completa todos los campos" | Faltan datos | Escribe tu correo y contraseña |
| "Correo o contraseña incorrectos" | Credenciales erróneas | Verifica y vuelve a intentar |
| "Error de conexión con la base de datos" | Problema del servidor | Inténtalo más tarde |

### Después del Login Exitoso:
- Serás redirigido a la **pantalla principal** (`app.html`).
- Verás tu nombre en la barra superior junto a un saludo personalizado.

---

## 5. La Pantalla Principal (Traductor)

Una vez que inicies sesión, verás la aplicación principal. Esta pantalla está dividida en dos secciones principales:

### Barra Superior
- **Saludo personalizado:** "Hola, [Tu Nombre] 👋"
- **Botón de Cerrar Sesión** (icono de caja con flecha): Te desconecta y regresa al login.

### Área de Trabajo (dos columnas):

#### Columna Izquierda — Entrada de Texto
- **Etiqueta:** "Escribe una palabra:"
- **Campo de texto:** Donde escribes la palabra que deseas traducir.
- **Botón "✨ Traducir":** Haz clic para buscar la seña.
- **Diccionario rápido:** Una lista debajo del botón con palabras sugeridas (hola, gracias, clima...).

#### Columna Derecha — Visualizador de Video
- **Área de video:** Un recuadro grande donde se reproduce el video de la seña.
- **Mensaje inicial:** "Aquí verás la seña" (antes de realizar una búsqueda).
- **Controles de video:** Play, pausa, volumen y progreso (controles nativos del reproductor).

---

## 6. Cómo Traducir una Palabra

### Método 1: Con el Botón
1. Escribe una palabra en el campo de texto (ejemplo: `hola`).
2. Haz clic en el botón **"✨ Traducir"**.
3. El video correspondiente a la seña aparecerá en el área de video y se reproducirá automáticamente.

### Método 2: Con el Teclado
1. Escribe una palabra en el campo de texto.
2. Presiona la tecla **Enter**.
3. El resultado será el mismo que con el botón.

### Resultados de la Búsqueda:

| Situación | Mensaje |
|-----------|---------|
| ✅ **Palabra encontrada** | Se muestra el video con la seña correspondiente |
| ❌ **Palabra no encontrada** | "No encontramos la seña para '[palabra]'" |
| ⚠️ **Campo vacío** | "Por favor, ingresa una palabra." |
| 🔄 **Buscando...** | "Buscando..." (mensaje temporal) |
| ❌ **Error de conexión** | "Error al conectar con la base de datos." |

### Lista de Palabras Disponibles (Ejemplos):

Estas son algunas de las palabras que puedes buscar en el traductor:

- **Saludos:** hola, buenos días, buenas tardes, buenas noches, adiós, nos vemos
- **Agradecimiento:** gracias, de nada, por favor, mucho gusto
- **Emociones:** cansancio, preocupación, alegría
- **Acciones:** caminar, trabajar, jugar, hablar, buscar, encontrar
- **Relaciones:** cada uno, todos, otro, diferente
- **Valores:** respetar, ayudar, compartir, decir, querer
- **Cantidad:** mucho, poco, poquito, nunca, siempre

> **Nota:** Si necesitas una seña que no está disponible, comunícate con el administrador del sistema para solicitar su adición.

---

## 7. El Diccionario

En la parte inferior del campo de búsqueda, encontrarás un **diccionario rápido** con una lista de palabras disponibles en el sistema.

- **Objetivo:** Sugerirte palabras que puedes traducir.
- **Comportamiento:** La lista se actualiza con las búsquedas que realices.
- **Uso:** Puedes hacer clic en las palabras sugeridas o escribirlas directamente en el campo de búsqueda.

---

## 8. Cerrar Sesión

Para salir de tu cuenta de forma segura:

1. Haz clic en el botón **"Cerrar Sesión"** ubicado en la esquina superior derecha de la pantalla.
2. Serás redirigido automáticamente a la pantalla de **Inicio de Sesión** (`index.html`).

**Nota:** Cerrar sesión limpia toda tu información almacenada localmente en el navegador.

---

## 9. Panel de Administración

### Solo para Administradores

El panel de administración permite gestionar el contenido de la aplicación. **Solo los usuarios con credenciales de administrador pueden acceder.**

### Acceso:
1. Inicia sesión con el correo oficial del administrador: `lscpage2026@gmail.com`.
2. Navega a la página `admin_sigmotion_hidden.html`.

### Funciones Disponibles:

#### 📹 Pestaña "Nueva Seña"
Permite agregar una nueva seña al sistema:

1. Ingresa la **palabra identificadora** en el campo de texto.
2. **Sube el archivo de video** de la seña:
   - **Opción A:** Haz clic en la zona de arrastrar y soltar para abrir el explorador de archivos.
   - **Opción B:** Arrastra el archivo de video directamente desde tu computadora.
3. El sistema acepta archivos de **video (.mp4)**.
4. Haz clic en **"Subir al Storage y Guardar"**.
5. Recibirás un mensaje de confirmación si la operación fue exitosa.

#### 👥 Pestaña "Gestionar Usuarios"
Permite ver y administrar todos los usuarios registrados:

| Acción | Descripción |
|--------|-------------|
| **Ver lista** | Tabla con nombre, correo y rol de cada usuario |
| **Refrescar** | Actualiza la lista de usuarios |
| **Cambiar rol** | Convierte un usuario entre "Admin" y "Alumno" |
| **Eliminar usuario** | Borra definitivamente una cuenta |

---

## 10. Preguntas Frecuentes (FAQ)

### 🔐 ¿Olvidé mi contraseña?
Actualmente no existe un sistema de recuperación de contraseña automático. Contacta al administrador del sistema para restablecer tu acceso.

### 🎥 ¿Por qué no se reproduce el video?
- Verifica que tu navegador esté actualizado.
- Asegúrate de tener una conexión a internet estable.
- Intenta recargar la página con **Ctrl + R** (o **Cmd + R** en Mac).
- Si el problema persiste, la seña puede no estar disponible aún.

### 🔍 ¿Puedo buscar palabras en inglés?
El sistema está optimizado para palabras en español. Sin embargo, si se han registrado señas con palabras en otros idiomas, también podrás encontrarlas.

### 👤 ¿Cómo sé si soy administrador?
Si tu correo es `lscpage2026@gmail.com`, tienes acceso al panel de administración. Si no lo eres, el sistema te negará el acceso.

### 📱 ¿Puedo usar la app en mi celular?
¡Sí! La aplicación es **responsiva** y se adapta a pantallas de cualquier tamaño. Sin embargo, para la mejor experiencia, recomendamos usar una pantalla de al menos 7 pulgadas.

### 💬 ¿Puedo sugerir nuevas señas?
Sí. Si deseas agregar una nueva seña pero no eres administrador, contacta al administrador del sistema o a tu docente para solicitar su inclusión.

---

## Glosario de Términos

| Término | Definición |
|---------|-----------|
| **Seña** | Movimiento de las manos que representa una palabra o concepto en lengua de señas |
| **Traductor** | Función que convierte una palabra escrita en un video de la seña correspondiente |
| **Dashboard/Panel de Admin** | Interfaz donde el administrador gestiona señas y usuarios |
| **Bucket** | Espacio de almacenamiento en la nube donde se guardan los videos |
| **Responsivo** | Diseño que se adapta a diferentes tamaños de pantalla |
| **SPA** | Aplicación de Página Única (Single Page Application) |

---

## Contacto y Soporte

Si necesitas ayuda adicional, tienes alguna sugerencia o encuentras un error:

- **Reporta un problema:** Abre un Issue en el repositorio de GitHub del proyecto.
- **Contacta al administrador:** lscpage2026@gmail.com

---

## Versión del Documento

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| 1.0.0 | Mayo 2026 | Versión inicial del Manual de Usuario |

---

*Proyecto desarrollado por el grupo **LSCPage 2026 Stack** como parte del trabajo de grado.*