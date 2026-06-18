// Configuracion - Devuelve script JS con variables inyectadas
module.exports = function handler(req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(`
// Credenciales inyectadas por Vercel
const CONFIG = {
    SUPABASE_URL: '${process.env.SUPABASE_URL || ''}',
    SUPABASE_KEY: '${process.env.SUPABASE_KEY || ''}'
};
`);
};