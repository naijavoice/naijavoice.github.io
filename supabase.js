// ============================================================
//  NAIJAVOICE — SUPABASE CONFIGURATION
// ============================================================
const SUPABASE_URL  = 'https://zszcmrbbgchafoydqoqb.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzemNtcmJiZ2NoYWZveWRxb3FiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzEwMTMsImV4cCI6MjA5MDQ0NzAxM30.9II959A9wOzXrVi1TEU7mtyqY2v-NFubLC7m_yOIE1U';
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);
