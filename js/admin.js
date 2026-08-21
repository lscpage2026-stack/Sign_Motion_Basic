document.addEventListener('DOMContentLoaded', async () => {
    const correoLogueado = localStorage.getItem('usuarioEmail');
    
    if (!correoLogueado) {
        alert("Acceso denegado: Debes iniciar sesión.");
        window.location.href = 'index.html';
        return;
    }

    // Verificar rol desde la base de datos
    try {
        const { data: usuario, error } = await _supabase
            .from('usuarios')
            .select('rol')
            .eq('correo', correoLogueado)
            .single();
        
        if (error || !usuario || usuario.rol !== 'admin') {
            alert("Acceso denegado: No tienes permisos de administrador.");
            window.location.href = 'app.html';
            return;
        }
    } catch (err) {
        console.error("Error verificando rol:", err);
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

    // --- GESTIÓN DE ETAPAS ---
    let etapaEditandoId = null;

    window.mostrarFormularioEtapa = () => {
        document.getElementById('form-etapa').classList.remove('d-none');
        etapaEditandoId = null;
        document.getElementById('etapa-nombre').value = '';
        document.getElementById('etapa-descripcion').value = '';
        document.getElementById('etapa-color').value = 'verde';
        document.getElementById('etapa-orden').value = '0';
    };

    window.ocultarFormularioEtapa = () => {
        document.getElementById('form-etapa').classList.add('d-none');
        etapaEditandoId = null;
    };

    window.guardarEtapa = async () => {
        const nombre = document.getElementById('etapa-nombre').value.trim();
        const descripcion = document.getElementById('etapa-descripcion').value.trim();
        const color = document.getElementById('etapa-color').value.trim() || 'verde';
        const orden = parseInt(document.getElementById('etapa-orden').value || '0', 10);

        if (!nombre) {
            alert('El nombre de la etapa es obligatorio');
            return;
        }

        try {
            if (etapaEditandoId) {
                await _supabase.from('etapas_aprendizaje').update({ nombre, descripcion, color, orden }).eq('id_etapa', etapaEditandoId);
            } else {
                await _supabase.from('etapas_aprendizaje').insert([{ nombre, descripcion, color, orden }]);
            }
            ocultarFormularioEtapa();
            cargarEtapas();
        } catch (err) {
            alert('Error guardando etapa: ' + err.message);
        }
    };

    window.editarEtapa = (etapa) => {
        etapaEditandoId = etapa.id_etapa;
        document.getElementById('form-etapa').classList.remove('d-none');
        document.getElementById('etapa-nombre').value = etapa.nombre || '';
        document.getElementById('etapa-descripcion').value = etapa.descripcion || '';
        document.getElementById('etapa-color').value = etapa.color || 'verde';
        document.getElementById('etapa-orden').value = etapa.orden || 0;
    };

    window.eliminarEtapa = async (id_etapa) => {
        if (!confirm('¿Eliminar esta etapa y todas sus unidades?')) return;
        const { error } = await _supabase.from('etapas_aprendizaje').delete().eq('id_etapa', id_etapa);
        if (!error) cargarEtapas();
    };

    async function cargarEtapas() {
        const container = document.getElementById('lista-etapas');
        const select = document.getElementById('select-etapa');
        try {
            const { data: etapas, error } = await _supabase.from('etapas_aprendizaje').select('*').order('orden', { ascending: true });
            if (error) throw error;

            container.innerHTML = '';
            select.innerHTML = '<option value="">Selecciona una etapa</option>';

            etapas.forEach(etapa => {
                const div = document.createElement('div');
                div.className = 'd-flex justify-content-between align-items-center border rounded p-2 mb-2';
                div.innerHTML = `
                    <div>
                        <strong>${etapa.nombre}</strong> <small class="text-muted">(${etapa.color})</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick='editarEtapa(${JSON.stringify(etapa)})'>✏️</button>
                        <button class="btn btn-sm btn-outline-danger" onclick='eliminarEtapa(${etapa.id_etapa})'>🗑️</button>
                    </div>
                `;
                container.appendChild(div);

                const option = document.createElement('option');
                option.value = etapa.id_etapa;
                option.textContent = etapa.nombre;
                select.appendChild(option);
            });
        } catch (err) {
            console.error('Error cargando etapas:', err);
        }
    }

    // --- GESTIÓN DE UNIDADES ---
    let unidadEditandoId = null;

    window.mostrarFormularioUnidad = () => {
        const etapaId = document.getElementById('select-etapa').value;
        if (!etapaId) {
            alert('Selecciona una etapa primero');
            return;
        }
        document.getElementById('form-unidad').classList.remove('d-none');
        unidadEditandoId = null;
        document.getElementById('unidad-palabra').value = '';
        document.getElementById('unidad-video').value = '';
        document.getElementById('unidad-orden').value = '0';
    };

    window.ocultarFormularioUnidad = () => {
        document.getElementById('form-unidad').classList.add('d-none');
        unidadEditandoId = null;
    };

    window.guardarUnidad = async () => {
        const id_etapa = parseInt(document.getElementById('select-etapa').value || '0', 10);
        const palabra = document.getElementById('unidad-palabra').value.trim();
        const url_video = document.getElementById('unidad-video').value.trim();
        const orden = parseInt(document.getElementById('unidad-orden').value || '0', 10);

        if (!id_etapa || !palabra || !url_video) {
            alert('Completa todos los campos');
            return;
        }

        try {
            if (unidadEditandoId) {
                await _supabase.from('unidades_aprendizaje').update({ id_etapa, palabra, url_video, orden }).eq('id_unidad', unidadEditandoId);
            } else {
                await _supabase.from('unidades_aprendizaje').insert([{ id_etapa, palabra, url_video, orden }]);
            }
            ocultarFormularioUnidad();
            cargarUnidades();
        } catch (err) {
            alert('Error guardando unidad: ' + err.message);
        }
    };

    window.editarUnidad = (unidad) => {
        unidadEditandoId = unidad.id_unidad;
        document.getElementById('form-unidad').classList.remove('d-none');
        document.getElementById('select-etapa').value = unidad.id_etapa;
        document.getElementById('unidad-palabra').value = unidad.palabra || '';
        document.getElementById('unidad-video').value = unidad.url_video || '';
        document.getElementById('unidad-orden').value = unidad.orden || 0;
    };

    window.eliminarUnidad = async (id_unidad) => {
        if (!confirm('¿Eliminar esta unidad?')) return;
        const { error } = await _supabase.from('unidades_aprendizaje').delete().eq('id_unidad', id_unidad);
        if (!error) cargarUnidades();
    };

    async function cargarUnidades() {
        const container = document.getElementById('lista-unidades');
        const id_etapa = document.getElementById('select-etapa').value;
        if (!id_etapa) {
            container.innerHTML = '<p class="text-muted">Selecciona una etapa para ver sus unidades.</p>';
            return;
        }

        try {
            const { data: unidades, error } = await _supabase.from('unidades_aprendizaje').select('*').eq('id_etapa', id_etapa).order('orden', { ascending: true });
            if (error) throw error;

            container.innerHTML = '';
            if (unidades.length === 0) {
                container.innerHTML = '<p class="text-muted">Sin unidades en esta etapa.</p>';
                return;
            }

            unidades.forEach(unidad => {
                const div = document.createElement('div');
                div.className = 'd-flex justify-content-between align-items-center border rounded p-2 mb-2';
                div.innerHTML = `
                    <div>
                        <strong>${unidad.palabra}</strong><br>
                        <small class="text-muted">${unidad.url_video}</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick='editarUnidad(${JSON.stringify(unidad)})'>✏️</button>
                        <button class="btn btn-sm btn-outline-danger" onclick='eliminarUnidad(${unidad.id_unidad})'>🗑️</button>
                    </div>
                `;
                container.appendChild(div);
            });
        } catch (err) {
            console.error('Error cargando unidades:', err);
        }
    }

    // Recargar unidades cuando cambie la etapa
    document.getElementById('select-etapa').addEventListener('change', cargarUnidades);

    // Cargar etapas al iniciar el panel de ruta
    const rutaTab = document.getElementById('pills-ruta-tab');
    if (rutaTab) {
        rutaTab.addEventListener('click', () => {
            cargarEtapas();
            cargarUnidades();
        });
    }

    // --- PRECARGA DE RUTA ---
    window.precargarRuta = async () => {
        if (!confirm('¿Precargar las 3 etapas y 46 unidades de ejemplo? Esto no borra datos existentes, solo agrega los que falten.')) return;

        try {
            // 1. Insertar etapas
            const etapasData = [
                { nombre: 'Saludos y Cortesías', descripcion: 'Aprende las señas básicas de saludo', color: 'verde', orden: 1 },
                { nombre: 'Acciones Cotidianas', descripcion: 'Domina los verbos y acciones esenciales', color: 'azul', orden: 2 },
                { nombre: 'Expresiones y Conceptos', descripcion: 'Profundiza en expresiones avanzadas', color: 'naranja', orden: 3 }
            ];

            const { data: etapas, error: errorEtapas } = await _supabase
                .from('etapas_aprendizaje')
                .select('id_etapa, nombre')
                .eq('activa', true)
                .order('orden');

            if (errorEtapas) throw errorEtapas;

            const etapaMap = {};
            if (etapas && etapas.length > 0) {
                etapas.forEach(e => { etapaMap[e.nombre] = e.id_etapa; });
            } else {
                const { data: nuevasEtapas, error: insertEtapasError } = await _supabase
                    .from('etapas_aprendizaje')
                    .insert(etapasData)
                    .select('id_etapa, nombre');

                if (insertEtapasError) throw insertEtapasError;
                nuevasEtapas.forEach(e => { etapaMap[e.nombre] = e.id_etapa; });
            }

            // 2. Preparar unidades
            const unidadesPorEtapa = {
                'Saludos y Cortesías': [
                    { palabra: 'hola', url_video: 'assets/videos/hola.mp4', orden: 1 },
                    { palabra: 'gracias', url_video: 'assets/videos/gracias.mp4', orden: 2 },
                    { palabra: 'por_favor', url_video: 'assets/videos/por_favor.mp4', orden: 3 },
                    { palabra: 'buenos_dias', url_video: 'assets/videos/buenos_dias.mp4', orden: 4 },
                    { palabra: 'buenas_tardes', url_video: 'assets/videos/buenas_tardes.mp4', orden: 5 },
                    { palabra: 'buenas_noches', url_video: 'assets/videos/buenas_noches.mp4', orden: 6 },
                    { palabra: 'chao', url_video: 'assets/videos/chao.mp4', orden: 7 },
                    { palabra: 'de_nada', url_video: 'assets/videos/de_nada.mp4', orden: 8 },
                    { palabra: 'como_estas', url_video: 'assets/videos/como_estas.mp4', orden: 9 },
                    { palabra: 'nos_vemos', url_video: 'assets/videos/nos_vemos.mp4', orden: 10 },
                    { palabra: 'mucho_gusto', url_video: 'assets/videos/mucho_gusto.mp4', orden: 11 },
                    { palabra: 'mucho_gusto_conocerte', url_video: 'assets/videos/mucho_gusto_conocerte.mp4', orden: 12 },
                    { palabra: 'respetar', url_video: 'assets/videos/respetar.mp4', orden: 13 },
                    { palabra: 'siempre', url_video: 'assets/videos/siempre.mp4', orden: 14 }
                ],
                'Acciones Cotidianas': [
                    { palabra: 'hablar', url_video: 'assets/videos/hablar.mp4', orden: 1 },
                    { palabra: 'comunicar', url_video: 'assets/videos/comunicar.mp4', orden: 2 },
                    { palabra: 'decir', url_video: 'assets/videos/decir.mp4', orden: 3 },
                    { palabra: 'buscar', url_video: 'assets/videos/buscar.mp4', orden: 4 },
                    { palabra: 'encontrar', url_video: 'assets/videos/encontrar.mp4', orden: 5 },
                    { palabra: 'esperar', url_video: 'assets/videos/esperar.mp4', orden: 6 },
                    { palabra: 'caminar', url_video: 'assets/videos/caminar.mp4', orden: 7 },
                    { palabra: 'trabajar', url_video: 'assets/videos/trabajar.mp4', orden: 8 },
                    { palabra: 'jugar', url_video: 'assets/videos/jugar.mp4', orden: 9 },
                    { palabra: 'ayudar', url_video: 'assets/videos/ayudar.mp4', orden: 10 },
                    { palabra: 'apoyar', url_video: 'assets/videos/apoyar.mp4', orden: 11 },
                    { palabra: 'responder', url_video: 'assets/videos/responder.mp4', orden: 12 },
                    { palabra: 'querer', url_video: 'assets/videos/querer.mp4', orden: 13 },
                    { palabra: 'pensar', url_video: 'assets/videos/pensar.mp4', orden: 14 },
                    { palabra: 'descanso', url_video: 'assets/videos/descanso.mp4', orden: 15 },
                    { palabra: 'tener', url_video: 'assets/videos/tener.mp4', orden: 16 }
                ],
                'Expresiones y Conceptos': [
                    { palabra: 'cansancio', url_video: 'assets/videos/cansancio.mp4', orden: 1 },
                    { palabra: 'dificil', url_video: 'assets/videos/dificil.mp4', orden: 2 },
                    { palabra: 'diferente', url_video: 'assets/videos/diferente.mp4', orden: 3 },
                    { palabra: 'atencion', url_video: 'assets/videos/atencion.mp4', orden: 4 },
                    { palabra: 'castigar', url_video: 'assets/videos/castigar.mp4', orden: 5 },
                    { palabra: 'cada_uno', url_video: 'assets/videos/cada_uno.mp4', orden: 6 },
                    { palabra: 'algunos', url_video: 'assets/videos/algunos.mp4', orden: 7 },
                    { palabra: 'mucho', url_video: 'assets/videos/Mucho..mp4', orden: 8 },
                    { palabra: 'no_hay', url_video: 'assets/videos/no_hay.mp4', orden: 9 },
                    { palabra: 'nunca', url_video: 'assets/videos/nunca.mp4', orden: 10 },
                    { palabra: 'olvidar', url_video: 'assets/videos/olvidar.mp4', orden: 11 },
                    { palabra: 'otro', url_video: 'assets/videos/otro.mp4', orden: 12 },
                    { palabra: 'perdon', url_video: 'assets/videos/perdon.mp4', orden: 13 },
                    { palabra: 'poco', url_video: 'assets/videos/poco.mp4', orden: 14 },
                    { palabra: 'poquito', url_video: 'assets/videos/poquito.mp4', orden: 15 },
                    { palabra: 'todos', url_video: 'assets/videos/todos.mp4', orden: 16 }
                ]
            };

            // 3. Obtener unidades existentes para no duplicar
            const { data: unidadesExistentes } = await _supabase
                .from('unidades_aprendizaje')
                .select('id_etapa, palabra');

            const existentesSet = new Set();
            if (unidadesExistentes) {
                unidadesExistentes.forEach(u => {
                    existentesSet.add(`${u.id_etapa}-${u.palabra}`);
                });
            }

            // 4. Insertar unidades faltantes
            const unidadesNuevas = [];
            for (const [nombreEtapa, unidades] of Object.entries(unidadesPorEtapa)) {
                const idEtapa = etapaMap[nombreEtapa];
                if (!idEtapa) continue;

                unidades.forEach(u => {
                    const key = `${idEtapa}-${u.palabra}`;
                    if (!existentesSet.has(key)) {
                        unidadesNuevas.push({ id_etapa: idEtapa, palabra: u.palabra, url_video: u.url_video, orden: u.orden });
                    }
                });
            }

            if (unidadesNuevas.length > 0) {
                // Insertar en lotes de 20 para evitar timeouts
                const lotes = [];
                for (let i = 0; i < unidadesNuevas.length; i += 20) {
                    lotes.push(unidadesNuevas.slice(i, i + 20));
                }

                for (const lote of lotes) {
                    const { error: insertUnidadesError } = await _supabase
                        .from('unidades_aprendizaje')
                        .insert(lote);
                    if (insertUnidadesError) throw insertUnidadesError;
                }
            }

            alert(`✅ Ruta precargada correctamente.\nEtapas: 3\nUnidades nuevas agregadas: ${unidadesNuevas.length}`);
            cargarEtapas();
            cargarUnidades();
        } catch (err) {
            alert('Error precargando ruta: ' + err.message);
            console.error(err);
        }
    };

    // --- GESTIÓN DE SEÑAS ---
    cargarListadoSenas();
});

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