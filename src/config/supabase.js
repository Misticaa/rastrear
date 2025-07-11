/**
 * Configuração do Supabase
 */
import { createClient } from '@supabase/supabase-js';

// ✅ CONFIGURAÇÕES SUPABASE - SUBSTITUA PELOS SEUS DADOS REAIS
const supabaseUrl = "https://SEU_PROJETO.supabase.co";
const supabaseKey = "SUA_CHAVE_PUBLICA";

// Verificar se as configurações estão definidas
if (!supabaseUrl || !supabaseKey || 
    supabaseUrl === "https://SEU_PROJETO.supabase.co" || 
    supabaseKey === "SUA_CHAVE_PUBLICA") {
    console.warn('⚠️ Configurações do Supabase não definidas. Configure em src/config/supabase.js');
}

export const supabase = supabaseUrl && supabaseKey && 
                       supabaseUrl !== "https://SEU_PROJETO.supabase.co" && 
                       supabaseKey !== "SUA_CHAVE_PUBLICA"
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export const isSupabaseConfigured = () => {
    return supabase !== null;
};

// Log de status
if (supabase) {
    console.log('✅ Supabase configurado e conectado');
} else {
    console.log('⚠️ Supabase não configurado - usando fallback localStorage');
}