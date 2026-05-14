document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Cargar nombre de usuario
    const nombreUsuario = localStorage.getItem('usuarioNombre');
    const labelSaludo = document.getElementById('user-name');
    if (nombreUsuario && labelSaludo) {
        labelSaludo.innerText = nombreUsuario;
    } else if (!nombreUsuario) {
        // Si no hay sesión, devolver al login
        window.location.href = 'index.html';
    }

    // 2. Elementos de la interfaz
    const btnBuscar = document.getElementById('btnBuscar');
    const inputBusqueda = document.getElementById('userInput');
    const videoPlayer = document.getElementById('v-player');
    const videoSource = document.getElementById('v-source');
    const placeholder = document.getElementById('v-placeholder');
    const errorMsg = document.getElementById('errorMsg');
    const btnLogout = document.getElementById('btnLogout');

    // 3. Función de búsqueda de señas
    async function traducirSena() {
        const palabra = inputBusqueda.value.toLowerCase().trim();
        
        if (!palabra) {
            errorMsg.innerText = "⚠️ Por favor, ingresa una palabra.";
            return;
        }

        try {
            errorMsg.innerText = "Buscando...";
            
            const { data, error } = await _supabase
                .from('senas')
                .select('url_drive') 
                .eq('palabra', palabra)
                .maybeSingle();

            if (error) throw error;

            if (data && data.url_drive) {
                errorMsg.innerText = "";
                
                // Actualizar video
                videoSource.src = data.url_drive;
                videoPlayer.load(); 
                
                // UI: Mostrar video, ocultar placeholder
                placeholder.classList.add('d-none');
                videoPlayer.classList.remove('d-none');
                
                videoPlayer.play().catch(e => console.log("Reproducción automática bloqueada."));

            } else {
                errorMsg.innerText = "❌ No encontramos la seña para '" + palabra + "'";
                videoPlayer.classList.add('d-none');
                placeholder.classList.remove('d-none');
            }

        } catch (err) {
            console.error(err);
            errorMsg.innerText = "Error al conectar con la base de datos.";
        }
    }

    // 4. Eventos
    if (btnBuscar) {
        btnBuscar.addEventListener('click', traducirSena);
    }

    if (inputBusqueda) {
        inputBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') traducirSena();
        });
    }

    // 5. Lógica del botón Cerrar Sesión
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});