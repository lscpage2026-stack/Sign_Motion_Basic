const PROGRESO_KEY = 'sigmotion_progreso_aprendizaje';
const FASE_APRENDE = 'aprende';
const FASE_PRACTICA = 'practica';
const FASE_COMPLETADO = 'completado';

let etapasCache = null;
let usuarioIdCache = null;
let progresoCache = null;

let estadoLeccion = {
    etapaIndex: 0,
    unidadIndex: 0,
    etapaId: null,
    unidadId: null,
    fase: FASE_APRENDE,
    opciones: [],
    respuestaCorrecta: '',
    respondido: false
};

// =====================
// DATOS DESDE BD
// =====================
async function cargarEtapas() {
    if (etapasCache) return etapasCache;

    const { data: etapas, error } = await _supabase
        .from('etapas_aprendizaje')
        .select('*')
        .order('orden', { ascending: true });

    if (error) {
        throw new Error('Error Supabase etapas: ' + error.message);
    }

    if (!etapas || etapas.length === 0) {
        throw new Error('No hay etapas configuradas en la base de datos.');
    }

    const { data: unidades, error: errorUnidades } = await _supabase
        .from('unidades_aprendizaje')
        .select('*')
        .order('orden', { ascending: true });

    if (errorUnidades) {
        throw new Error('Error Supabase unidades: ' + errorUnidades.message);
    }

    const unidadesPorEtapa = {};
    (unidades || []).forEach(u => {
        if (!unidadesPorEtapa[u.id_etapa]) unidadesPorEtapa[u.id_etapa] = [];
        unidadesPorEtapa[u.id_etapa].push(u);
    });

    etapasCache = etapas.map(e => ({
        id: e.id_etapa,
        nombre: e.nombre,
        descripcion: e.descripcion,
        color: e.color || 'verde',
        unidades: (unidadesPorEtapa[e.id_etapa] || []).map(u => ({
            id: u.id_unidad,
            palabra: u.palabra,
            video: u.url_video,
            orden: u.orden || 0
        }))
    }));

    return etapasCache;
}

async function obtenerUsuarioId() {
    if (usuarioIdCache) return usuarioIdCache;

    const correo = localStorage.getItem('usuarioEmail');
    if (!correo) return null;

    const { data, error } = await _supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('correo', correo)
        .maybeSingle();

    if (error || !data) return null;
    usuarioIdCache = data.id_usuario;
    return usuarioIdCache;
}

// =====================
// PROGRESO
// =====================
async function obtenerProgreso() {
    if (progresoCache) return progresoCache;

    const userId = await obtenerUsuarioId();
    if (!userId) {
        try {
            const data = localStorage.getItem(PROGRESO_KEY);
            if (data) {
                progresoCache = JSON.parse(data);
                return progresoCache;
            }
        } catch (e) { }
        progresoCache = { etapas: (etapasCache || []).map(() => ([])), local: true };
        return progresoCache;
    }

    const { data, error } = await _supabase
        .from('progreso_usuario')
        .select('id_unidad, completado')
        .eq('id_usuario', userId);

    if (error) {
        progresoCache = { etapas: (etapasCache || []).map(() => ([])), local: true };
        return progresoCache;
    }

    const etapas = await cargarEtapas();
    const progresoArray = etapas.map(() => ([]));

    data.forEach(row => {
        etapas.forEach((etapa, eIndex) => {
            const unidad = etapa.unidades.find(u => u.id === row.id_unidad);
            if (unidad) {
                const uIndex = etapa.unidades.indexOf(unidad);
                progresoArray[eIndex][uIndex] = row.completado;
            }
        });
    });

    progresoCache = { etapas: progresoArray, local: false };
    return progresoCache;
}

async function guardarProgreso(progreso) {
    const userId = await obtenerUsuarioId();
    if (!userId) {
        localStorage.setItem(PROGRESO_KEY, JSON.stringify(progreso));
        progresoCache = progreso;
        return;
    }

    const etapas = await cargarEtapas();
    const filas = [];

    progreso.etapas.forEach((arr, eIndex) => {
        arr.forEach((completado, uIndex) => {
            const unidad = etapas[eIndex]?.unidades[uIndex];
            if (unidad) {
                filas.push({
                    id_usuario: userId,
                    id_unidad: unidad.id,
                    completado: completado || false
                });
            }
        });
    });

    for (const fila of filas) {
        await _supabase.from('progreso_usuario').upsert([fila], {
            onConflict: 'id_usuario,id_unidad'
        });
    }

    localStorage.setItem(PROGRESO_KEY, JSON.stringify(progreso));
    progresoCache = progreso;
}

async function estaUnidadCompletada(etapaIndex, unidadIndex, progreso) {
    if (!progreso) progreso = await obtenerProgreso();
    return !!(progreso.etapas[etapaIndex] && progreso.etapas[etapaIndex][unidadIndex]);
}

async function marcarUnidadCompletada(etapaIndex, unidadIndex) {
    const progreso = await obtenerProgreso();
    if (!progreso.etapas[etapaIndex]) progreso.etapas[etapaIndex] = [];
    progreso.etapas[etapaIndex][unidadIndex] = true;
    await guardarProgreso(progreso);
}

async function esUnidadDisponible(etapaIndex, unidadIndex, progreso) {
    if (estadoLeccion.etapaIndex < etapaIndex) return false;

    const etapas = etapasCache || await cargarEtapas();
    const etapa = etapas[etapaIndex];
    if (unidadIndex === 0) return true;

    if (!progreso) progreso = await obtenerProgreso();
    if (!progreso.etapas[etapaIndex]) return false;

    for (let i = 0; i < unidadIndex; i++) {
        if (!progreso.etapas[etapaIndex][i]) return false;
    }
    return true;
}

async function esEtapaBloqueada(etapaIndex, progreso) {
    if (etapaIndex === 0) return false;
    const etapas = etapasCache || await cargarEtapas();
    const etapaAnterior = etapas[etapaIndex - 1];
    if (!progreso) progreso = await obtenerProgreso();
    const completadasAnterior = (progreso.etapas[etapaIndex - 1] || []).filter(Boolean).length;
    return completadasAnterior < etapaAnterior.unidades.length;
}

// =====================
// UTILIDADES
// =====================
async function obtenerPalabraAleatoriaDistinta(palabraExcluida) {
    const etapas = etapasCache || await cargarEtapas();
    const todas = [];
    etapas.forEach(etapa => {
        etapa.unidades.forEach(u => {
            if (u.palabra !== palabraExcluida) todas.push(u.palabra);
        });
    });
    return todas[Math.floor(Math.random() * todas.length)];
}

async function generarOpciones(palabraCorrecta) {
    const opciones = [palabraCorrecta];
    while (opciones.length < 3) {
        const candidata = await obtenerPalabraAleatoriaDistinta(palabraCorrecta);
        if (!opciones.includes(candidata)) opciones.push(candidata);
    }
    // Mezclar
    for (let i = opciones.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
    }
    return opciones;
}

// =====================
// RENDERIZADO RUTA
// =====================
async function renderRuta() {
    const container = document.getElementById('ruta-container');
    if (!container) return;

    let etapas;
    try {
        etapas = etapasCache || await cargarEtapas();
    } catch (e) {
        container.innerHTML = '<div class="text-center text-danger">Error cargando etapas: ' + e.message + '</div>';
        return;
    }

    const progreso = await obtenerProgreso();
    const iconosEtapa = { verde: '🌱', azul: '💧', naranja: '🌞', rojo: '🔥', morado: '🔮' };

    let html = '';

    for (let eIndex = 0; eIndex < etapas.length; eIndex++) {
        const etapa = etapas[eIndex];
        const bloqueada = await esEtapaBloqueada(eIndex, progreso);
        const completadas = (progreso.etapas[eIndex] || []).filter(Boolean).length;
        const total = etapa.unidades.length;
        const claseBloqueada = bloqueada ? 'etapa--bloqueada' : '';

        html += `
            <div class="etapa etapa--${etapa.color} ${claseBloqueada}">
                <div class="etapa__header">
                    <div class="etapa__icono">${iconosEtapa[etapa.color] || '📚'}</div>
                    <div class="etapa__info">
                        <h2>Etapa ${etapa.id}: ${etapa.nombre}</h2>
                        <p>${etapa.descripcion}</p>
                    </div>
                    <div class="etapa__progreso">${completadas} / ${total}</div>
                </div>
                <div class="unidades">
        `;

        for (let uIndex = 0; uIndex < etapa.unidades.length; uIndex++) {
            const unidad = etapa.unidades[uIndex];
            const disponible = await esUnidadDisponible(eIndex, uIndex, progreso);
            const completada = await estaUnidadCompletada(eIndex, uIndex, progreso);

            let clase = '';
            if (completada) clase = 'unidad--completada';
            else if (disponible) clase = 'unidad--disponible';
            else clase = 'unidad--bloqueada';

            const href = disponible ? `leccion.html?etapa=${eIndex}&unidad=${uIndex}` : '#';

            html += `
                <a href="${href}" class="unidad ${clase}" title="${unidad.palabra}" onclick="return ${disponible ? 'true' : 'false'};">
                    <div class="unidad__circulo"></div>
                    <div class="unidad__label">${unidad.palabra.replace(/_/g, ' ')}</div>
                </a>
            `;
        }

        html += `
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

// =====================
// RENDERIZADO LECCIÓN
// =====================
async function renderLeccion() {
    const container = document.getElementById('leccion-contenido');
    const titulo = document.getElementById('leccion-titulo');
    const progressBarContainer = document.getElementById('progreso-bar-container');
    const progressFill = document.getElementById('progreso-fill');

    if (!container) return;

    const etapas = etapasCache || await cargarEtapas();
    const etapa = etapas[estadoLeccion.etapaIndex];
    const unidad = etapa.unidades[estadoLeccion.unidadIndex];

    if (titulo) {
        titulo.textContent = `Etapa ${etapa.id}: ${unidad.palabra.replace(/_/g, ' ')}`;
    }

    if (progressBarContainer) {
        progressBarContainer.style.display = (estadoLeccion.fase === FASE_PRACTICA) ? 'block' : 'none';
        if (progressFill) {
            const totalUnidades = etapa.unidades.length;
            const completadas = (await obtenerProgreso()).etapas[estadoLeccion.etapaIndex]?.filter(Boolean).length || 0;
            const pct = ((completadas + (estadoLeccion.fase === FASE_COMPLETADO ? 1 : 0)) / totalUnidades) * 100;
            progressFill.style.width = Math.min(pct, 100) + '%';
        }
    }

    if (estadoLeccion.fase === FASE_APRENDE) {
        container.innerHTML = `
            <div class="leccion-fase leccion-fase--activa">
                <div class="fase-aprende__card">
                    <video class="fase-aprende__video" controls>
                        <source src="${unidad.video}" type="video/mp4">
                        Tu navegador no soporta videos.
                    </video>
                    <div class="fase-aprende__palabra">${unidad.palabra.replace(/_/g, ' ')}</div>
                    <p class="fase-aprende__indicacion">Observa la seña y pronuncia la palabra</p>
                    <button class="btn-primario" id="btn-continuar-aprende">Continuar</button>
                </div>
            </div>
        `;
        document.getElementById('btn-continuar-aprende').addEventListener('click', () => {
            avanzarFase(FASE_PRACTICA);
        });

    } else if (estadoLeccion.fase === FASE_PRACTICA) {
        const opciones = estadoLeccion.opciones;
        let botonesHtml = '';
        opciones.forEach((op, idx) => {
            const iconoLetra = String.fromCharCode(65 + idx);
            botonesHtml += `
                <button class="opcion-btn" data-palabra="${op}" onclick="seleccionarOpcion(this, '${op}')">
                    <span class="opcion-btn__icono">${iconoLetra}</span>
                    <span>${op.replace(/_/g, ' ')}</span>
                </button>
            `;
        });

        container.innerHTML = `
            <div class="leccion-fase leccion-fase--activa">
                <video class="fase-practica__video" controls id="video-practica">
                    <source src="${unidad.video}" type="video/mp4">
                </video>
                <div class="fase-practica__pregunta">¿Qué significa esta seña?</div>
                <div class="fase-practica__opciones" id="opciones-container">
                    ${botonesHtml}
                </div>
                <button class="btn-primario" id="btn-continuar-practica" style="display:none;">Continuar</button>
            </div>
        `;

        document.getElementById('btn-continuar-practica').addEventListener('click', () => {
            if (estadoLeccion.respondido) {
                finalizarUnidad();
            }
        });

    } else if (estadoLeccion.fase === FASE_COMPLETADO) {
        container.innerHTML = `
            <div class="leccion-fase leccion-fase--activa">
                <div class="fase-completado__card">
                    <div class="fase-completado__icono">🎉</div>
                    <div class="fase-completado__titulo">¡Lección completada!</div>
                    <p class="fase-completado__texto">Excelente trabajo. Has aprendido la seña de <strong>${unidad.palabra.replace(/_/g, ' ')}</strong>.</p>
                    <button class="btn-primario" id="btn-siguiente">Siguiente</button>
                </div>
            </div>
        `;
        document.getElementById('btn-siguiente').addEventListener('click', () => {
            irASiguienteUnidad();
        });
    }
}

// =====================
// LÓGICA DE LECCIÓN
// =====================
async function avanzarFase(nuevaFase) {
    estadoLeccion.fase = nuevaFase;

    if (nuevaFase === FASE_PRACTICA) {
        estadoLeccion.opciones = await generarOpciones(estadoLeccion.respuestaCorrecta);
        estadoLeccion.respondido = false;
    }

    await renderLeccion();
}

async function seleccionarOpcion(btnElement, palabra) {
    if (estadoLeccion.respondido) return;

    estadoLeccion.respondido = true;
    const esCorrecto = palabra === estadoLeccion.respuestaCorrecta;

    const todosBotones = document.querySelectorAll('.opcion-btn');
    todosBotones.forEach(b => {
        b.disabled = true;
        if (b.dataset.palabra === estadoLeccion.respuestaCorrecta) {
            b.classList.add('opcion-btn--correcto');
            b.querySelector('.opcion-btn__icono').textContent = '✓';
        } else if (b === btnElement && !esCorrecto) {
            b.classList.add('opcion-btn--incorrecto');
            b.querySelector('.opcion-btn__icono').textContent = '✕';
        }
    });

    const btnContinuar = document.getElementById('btn-continuar-practica');
    if (btnContinuar) {
        btnContinuar.style.display = 'block';
        btnContinuar.textContent = esCorrecto ? 'Continuar' : 'Reintentar';
        if (!esCorrecto) {
            btnContinuar.onclick = async () => {
                estadoLeccion.respondido = false;
                estadoLeccion.opciones = await generarOpciones(estadoLeccion.respuestaCorrecta);
                await renderLeccion();
            };
        } else {
            btnContinuar.onclick = () => finalizarUnidad();
        }
    }
}

async function finalizarUnidad() {
    await marcarUnidadCompletada(estadoLeccion.etapaIndex, estadoLeccion.unidadIndex);
    await avanzarFase(FASE_COMPLETADO);
}

async function irASiguienteUnidad() {
    const etapas = etapasCache || await cargarEtapas();
    const etapa = etapas[estadoLeccion.etapaIndex];

    if (estadoLeccion.unidadIndex + 1 < etapa.unidades.length) {
        estadoLeccion.unidadIndex++;
        estadoLeccion.unidadId = etapa.unidades[estadoLeccion.unidadIndex].id;
        estadoLeccion.etapaId = etapa.id;
        estadoLeccion.respuestaCorrecta = etapa.unidades[estadoLeccion.unidadIndex].palabra;
        estadoLeccion.fase = FASE_APRENDE;
        estadoLeccion.respondido = false;
        estadoLeccion.opciones = [];
        await renderLeccion();
    } else {
        await marcarUnidadCompletada(estadoLeccion.etapaIndex, estadoLeccion.unidadIndex);
        if (estadoLeccion.etapaIndex + 1 < etapas.length) {
            const params = new URLSearchParams(window.location.search);
            params.set('etapa', estadoLeccion.etapaIndex + 1);
            params.set('unidad', 0);
            window.location.href = `leccion.html?${params.toString()}`;
        } else {
            window.location.href = 'ruta.html?completado=true';
        }
    }
}

function salirLeccion() {
    window.location.href = 'ruta.html';
}

// =====================
// INICIALIZACIÓN
// =====================
async function inicializar() {
    const nombreUsuario = localStorage.getItem('usuarioNombre');
    if (!nombreUsuario) {
        window.location.href = 'index.html';
        return;
    }

    const path = window.location.pathname.toLowerCase();

    try {
        await cargarEtapas();
    } catch (e) {
        const container = document.getElementById('ruta-container') || document.getElementById('leccion-contenido');
        if (container) {
            container.innerHTML = `
                <div class="text-center p-5">
                    <h3 class="text-danger">Error cargando ruta de aprendizaje</h3>
                    <p>${e.message}</p>
                    <button class="btn btn-primary mt-3" onclick="window.location.href='app.html'">Volver al inicio</button>
                </div>
            `;
        } else {
            alert('Error cargando ruta: ' + e.message);
            window.location.href = 'app.html';
        }
        return;
    }

    if (path.includes('ruta.html')) {
        await renderRuta();
    } else if (path.includes('leccion.html')) {
        const params = new URLSearchParams(window.location.search);
        const etapaIndex = parseInt(params.get('etapa') || '0', 10);
        const unidadIndex = parseInt(params.get('unidad') || '0', 10);

        const etapas = etapasCache || await cargarEtapas();

        if (isNaN(etapaIndex) || isNaN(unidadIndex) || etapaIndex >= etapas.length) {
            window.location.href = 'ruta.html';
            return;
        }

        const etapa = etapas[etapaIndex];
        if (unidadIndex >= etapa.unidades.length) {
            window.location.href = 'ruta.html';
            return;
        }

        const disponible = await esUnidadDisponible(etapaIndex, unidadIndex);
        if (!disponible) {
            window.location.href = 'ruta.html';
            return;
        }

        estadoLeccion = {
            etapaIndex: etapaIndex,
            unidadIndex: unidadIndex,
            etapaId: etapa.id,
            unidadId: etapa.unidades[unidadIndex].id,
            fase: FASE_APRENDE,
            opciones: [],
            respuestaCorrecta: etapa.unidades[unidadIndex].palabra,
            respondido: false
        };

        await renderLeccion();
    }
}

document.addEventListener('DOMContentLoaded', inicializar);