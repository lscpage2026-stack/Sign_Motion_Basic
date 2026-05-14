document.addEventListener('DOMContentLoaded', () => {
    // 1. Referencias a los elementos del formulario
    const btnRegistrar = document.getElementById('btnRegistrar');
    const regNombre = document.getElementById('regNombre');
    const regEmail = document.getElementById('regEmail');
    const regPass = document.getElementById('regPass');
    const regPassConfirm = document.getElementById('regPassConfirm');
    const errorRegistro = document.getElementById('errorRegistro');
    const registroForm = document.getElementById('registroForm');

    // 2. Función principal de registro
    async function validarYRegistrar() {
        // Obtenemos los valores actuales
        const nombre = regNombre.value.trim();
        const email = regEmail.value.trim().toLowerCase(); // Guardar siempre en minúsculas
        const pass = regPass.value.trim();
        const passConfirm = regPassConfirm.value.trim();

        // --- VALIDACIONES ---
        
        // Verificar campos vacíos
        if (nombre === '' || email === '' || pass === '' || passConfirm === '') {
            mostrarError("Por favor, completa todos los campos.");
            return;
        }

        // Verificar que las contraseñas coincidan
        if (pass !== passConfirm) {
            mostrarError("Las contraseñas no coinciden.");
            return;
        }

        // Validación simple de formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            mostrarError("Por favor, ingresa un correo electrónico válido.");
            return;
        }

        // Ocultar error previo y cambiar estado del botón
        errorRegistro.style.display = 'none';
        btnRegistrar.disabled = true;
        btnRegistrar.innerText = "Creando cuenta...";

        // --- CONEXIÓN CON SUPABASE ---
        try {
            // Nota: El campo 'rol' se asigna automáticamente como 'alumno' en Supabase
            const { data, error } = await _supabase
                .from('usuarios')
                .insert([
                    { 
                        nombre_completo: nombre, 
                        correo: email, 
                        password: pass 
                    }
                ]);

            if (error) {
                // Error común: El correo ya existe
                if (error.code === '23505') {
                    mostrarError("Este correo ya está registrado.");
                } else {
                    mostrarError("Error en el registro: " + error.message);
                }
                btnRegistrar.disabled = false;
                btnRegistrar.innerText = "Registrarse";
            } else {
                // Registro exitoso
                alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión como alumno.");
                window.location.href = 'index.html';
            }

        } catch (err) {
            console.error("Error inesperado:", err);
            mostrarError("No se pudo conectar con el servidor.");
            btnRegistrar.disabled = false;
            btnRegistrar.innerText = "Registrarse";
        }
    }

    // 3. Funciones auxiliares
    function mostrarError(mensaje) {
        errorRegistro.textContent = mensaje;
        errorRegistro.style.display = 'block';
    }

    // 4. Eventos
    if (btnRegistrar) {
        btnRegistrar.addEventListener('click', (e) => {
            e.preventDefault();
            validarYRegistrar();
        });
    }

    if (registroForm) {
        registroForm.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                validarYRegistrar();
            }
        });
    }
});