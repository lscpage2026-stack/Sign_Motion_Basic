document.addEventListener('DOMContentLoaded', () => {
    // 1. CONFIGURACIÓN DE SEGURIDAD
    const CORREO_ADMIN_AUTORIZADO = 'lscpage2026@gmail.com'; 
    const correoLogueado = localStorage.getItem('usuarioEmail');

    if (!correoLogueado || correoLogueado.toLowerCase() !== CORREO_ADMIN_AUTORIZADO.toLowerCase()) {
        alert("Acceso denegado: No tienes permisos de administrador.");
        window.location.href = 'app.html';
        return; 
    }

    // 2. ELEMENTOS DE LA INTERFAZ
    const adminForm = document.getElementById('adminForm');
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('drop-zone');
    const status = document.getElementById('adminStatus');
    const fileInfo = document.getElementById('file-info');
    const tablaUsuariosBody = document.getElementById('tablaUsuariosBody');

    // --- LÓGICA DE VIDEOS (DRAG & DROP) ---
    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) confirmarArchivo(fileInput.files[0]);
    });

    ['dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (eventName === 'dragover') dropZone.classList.add('drop-zone--over');
            else dropZone.classList.remove('drop-zone--over');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length) {
            fileInput.files = files;
            confirmarArchivo(files[0]);
        }
    });

    function confirmarArchivo(file) {
        fileInfo.innerText = `Archivo listo: ${file.name}`;
        fileInfo.classList.remove('d-none');
        dropZone.querySelector('.drop-zone__prompt').innerText = "✅ ¡Video cargado!";
    }

    // --- SUBIDA A STORAGE Y BASE DE DATOS ---
    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const palabra = document.getElementById('adminPalabra').value.toLowerCase().trim();
        const videoFile = fileInput.files[0];

        if (!palabra || !videoFile) return mostrarEstado("Completa todos los campos.", "alert-warning");

        mostrarEstado("Subiendo video al Storage...", "alert-info");

        try {
            const nombreArchivo = `${Date.now()}_${videoFile.name.replace(/\s+/g, '_')}`;
            const { error: uploadError } = await _supabase.storage.from('videos').upload(nombreArchivo, videoFile);
            if (uploadError) throw uploadError;

            const { data: urlData } = _supabase.storage.from('videos').getPublicUrl(nombreArchivo);
            
            const { error: dbError } = await _supabase.from('senas').insert([{ palabra: palabra, url_drive: urlData.publicUrl }]);
            if (dbError) throw dbError;

            mostrarEstado(`¡Excelente! La seña "${palabra}" se guardó correctamente.`, "alert-success");
            adminForm.reset();
            fileInfo.classList.add('d-none');
            dropZone.querySelector('.drop-zone__prompt').innerText = "Arrastra el video aquí o haz clic para subir";
            cargarListadoSenas();
        } catch (err) {
            mostrarEstado("Error: " + err.message, "alert-danger");
        }
    });

    // --- GESTIÓN DE USUARIOS ---
    window.cargarUsuarios = async () => {
        tablaUsuariosBody.innerHTML = '<tr><td colspan="4" class="text-center">Cargando...</td></tr>';
        
        try {
            const { data: usuarios, error } = await _supabase
                .from('usuarios')
                .select('*')
                .order('nombre_completo', { ascending: true });

            if (error) throw error;

            tablaUsuariosBody.innerHTML = '';
            usuarios.forEach(user => {
                const tr = document.createElement('tr');
                const badgeClass = user.rol === 'admin' ? 'badge-admin' : 'badge-alumno';
                
                tr.innerHTML = `
                    <td>${user.nombre_completo}</td>
                    <td>${user.correo}</td>
                    <td><span class="${badgeClass}">${user.rol || 'alumno'}</span></td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="cambiarRol('${user.correo}', '${user.rol}')">
                            ${user.rol === 'admin' ? 'Hacer Alumno' : 'Hacer Admin'}
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarUsuario('${user.correo}')">🗑️</button>
                    </td>
                `;
                tablaUsuariosBody.appendChild(tr);
            });
        } catch (err) {
            tablaUsuariosBody.innerHTML = '<tr><td colspan="4" class="text-danger">Error al cargar.</td></tr>';
        }
    };

    window.cambiarRol = async (correoUsuario, rolActual) => {
        const nuevoRol = rolActual === 'admin' ? 'alumno' : 'admin';
        
        if (!confirm(`¿Cambiar rol de ${correoUsuario} a ${nuevoRol}?`)) return;

        try {
            const { data, error } = await _supabase
                .from('usuarios')
                .update({ rol: nuevoRol })
                .eq('correo', correoUsuario)
                .select();

            if (error) {
                alert("Error de Supabase: " + error.message);
                return;
            }

            alert(`✅ Rol de ${correoUsuario} actualizado`);
            cargarUsuarios();
        } catch (err) {
            console.error(err);
        }
    };

    window.eliminarUsuario = async (correoUsuario) => {
        if (!confirm(`¿Eliminar a ${correoUsuario}?`)) return;
        const { error } = await _supabase
            .from('usuarios')
            .delete()
            .eq('correo', correoUsuario);
        if (!error) cargarUsuarios();
    };

    function mostrarEstado(mensaje, clase) {
        status.innerText = mensaje;
        status.className = `alert ${clase} mt-3`;
        status.classList.remove('d-none');
    }
});

// --- GESTIÓN DE SEÑAS ---
async function cargarListadoSenas() {
    const tabla = document.getElementById('tablaSenasBody');
    const { data: senas, error } = await _supabase.from('senas').select('*').order('palabra', { ascending: true });

    if (error) return console.error(error);

    tabla.innerHTML = '';
    senas.forEach(sena => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold text-capitalize">${sena.palabra}</td>
            <td><a href="${sena.url_drive}" target="_blank" class="btn btn-sm btn-link">Ver video</a></td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarSena('${sena.id}', '${sena.url_drive}')">🗑️ Borrar</button>
            </td>
        `;
        tabla.appendChild(tr);
    });
}

window.eliminarSena = async (id, urlVideo) => {
    if (!confirm("¿Eliminar esta seña?")) return;
    
    const { error } = await _supabase.from('senas').delete().eq('id', id);
    if (!error) cargarListadoSenas();
};

document.addEventListener('DOMContentLoaded', cargarListadoSenas);