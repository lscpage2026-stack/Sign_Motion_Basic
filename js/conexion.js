// Se crea el cliente una sola vez usando los datos de CONFIG
const _supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);