// Script de build para Vercel - Inyecta variables de entorno en config.js
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'js', 'config.js');

// Usar variables de entorno de Vercel o valores por defecto
const supabaseUrl = process.env.SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_tu-clave-aqui';

const configContent = `// Configuracion inyectada por Vercel
const CONFIG = {
    SUPABASE_URL: '${supabaseUrl}',
    SUPABASE_KEY: '${supabaseKey}'
};`;

fs.writeFileSync(configPath, configContent);
console.log('Variables de entorno inyectadas en js/config.js');