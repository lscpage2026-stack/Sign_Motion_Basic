document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del HTML (index.html)
    const btnLogin = document.getElementById('btnLogin');
    const emailInput = document.getElementById('logEmail');
    const passInput = document.getElementById('logPass');
    const errorLogin = document.getElementById('errorLogin');

    async function iniciarSesion() {
        const email = emailInput.value.trim();
        const pass = passInput.value.trim();

        // 1. Validación básica de campos vacíos
        if (!email || !pass) {
            errorLogin.textContent = "Por favor, completa todos los campos.";
            errorLogin.style.display = 'block';
            return;
        }

        try {
            // 2. Consulta a la tabla 'usuarios' en Supabase
            const { data, error } = await _supabase
                .from('usuarios')
                .select('*')
                .eq('correo', email)
                .eq('password', pass)
                .maybeSingle();

            if (error) {
                console.error("Error de Supabase:", error.message);
                errorLogin.textContent = "Error de conexión con la base de datos.";
                errorLogin.style.display = 'block';
                return;
            }

            // 3. Verificar si el usuario existe
            if (data) {
                // --- CAMBIO AQUÍ: Guardamos nombre Y correo ---
                localStorage.setItem('usuarioNombre', data.nombre_completo);
                localStorage.setItem('usuarioEmail', data.correo); 
                
                // Redirigir a la aplicación principal
                window.location.href = 'app.html';
            } else {
                // Credenciales incorrectas
                errorLogin.textContent = "Correo o contraseña incorrectos.";
                errorLogin.style.display = 'block';
            }

        } catch (err) {
            console.error("Error inesperado:", err);
            errorLogin.textContent = "Hubo un problema al intentar iniciar sesión.";
            errorLogin.style.display = 'block';
        }
    }

    // Evento clic en el botón
    if (btnLogin) {
        btnLogin.addEventListener('click', (e) => {
            e.preventDefault();
            iniciarSesion();
        });
    }

    // Permitir iniciar sesión al presionar Enter
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            iniciarSesion();
        }
    });
});