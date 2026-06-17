document.addEventListener('DOMContentLoaded', () => {
     // 1. Cargar nombre de usuario
     const nombreUsuario = localStorage.getItem('usuarioNombre');
     const labelSaludo = document.getElementById('user-name');
     if (nombreUsuario && labelSaludo) {
         labelSaludo.innerText = nombreUsuario;
     } else if (!nombreUsuario) {
         window.location.href = 'index.html';
         return;
     }

     // 2. Elementos de la interfaz
     const selectPalabras = document.getElementById('userInput');
     const btnBuscar = document.getElementById('btnBuscar');
     const videoPlayer = document.getElementById('v-player');
     const videoSource = document.getElementById('v-source');
     const placeholder = document.getElementById('v-placeholder');
     const errorMsg = document.getElementById('errorMsg');
     const btnLogout = document.getElementById('btnLogout');

     // 3. Función de carga del diccionario
     async function cargarDiccionario() {
         try {
             const { data, error } = await _supabase
                 .from('senas')
                 .select('palabra')
                 .order('palabra', { ascending: true });
             
             if (error) throw error;
             
             selectPalabras.innerHTML = '<option value="" selected disabled>-- Selecciona una palabra --</option>';
             data.forEach(item => {
                 const option = document.createElement('option');
                 option.value = item.palabra;
                 option.textContent = item.palabra;
                 selectPalabras.appendChild(option);
             });
         } catch (err) {
             selectPalabras.innerHTML = '<option>Error al cargar palabras</option>';
         }
     }

     // 4. Función de búsqueda de señas
     async function traducirSena() {
         const palabra = selectPalabras.value.toLowerCase().trim();
         
         if (!palabra) {
             errorMsg.innerText = "⚠️ Por favor, selecciona una palabra.";
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
                 videoSource.src = data.url_drive;
                 videoPlayer.load(); 
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

     // 5. Cargar diccionario al iniciar
     cargarDiccionario();

     // 6. Eventos
     if (btnBuscar) {
         btnBuscar.addEventListener('click', traducirSena);
     }

     if (selectPalabras) {
         selectPalabras.addEventListener('keypress', (e) => {
             if (e.key === 'Enter') traducirSena();
         });
     }

     // 7. Cerrar sesión
     if (btnLogout) {
         btnLogout.addEventListener('click', () => {
             localStorage.clear();
             window.location.href = 'index.html';
         });
     }
});