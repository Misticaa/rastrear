/**
 * Serviço de banco de dados com Supabase
 */
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

export class DatabaseService {
    constructor() {
        this.isConfigured = isSupabaseConfigured();
        if (!this.isConfigured) {
            console.warn('⚠️ Supabase não configurado. Usando armazenamento local como fallback.');
        }
    }

    async createLead(leadData) {
        if (!this.isConfigured) {
            return this.createLeadFallback(leadData);
        }

        try {
            // Adicionar timestamp inicial se não existir
            const leadWithTimestamp = {
                ...leadData,
                nome_completo: leadData.nome_completo || leadData.nome || 'Cliente Shopee',
                initial_timestamp: leadData.initial_timestamp || new Date().toISOString(),
                liberation_paid: false,
                delivery_attempts: 0,
                liberation_date: null
            };
            
            console.log('💾 SALVANDO LEAD NO SUPABASE:', {
                cpf: leadWithTimestamp.cpf,
                nome_completo: leadWithTimestamp.nome_completo,
                initial_timestamp: leadWithTimestamp.initial_timestamp
            });

            const { data, error } = await supabase
                .from('leads')
                .insert([leadWithTimestamp])
                .select()
                .single();

            if (error) {
                console.error('Erro ao criar lead:', error);
                return this.createLeadFallback(leadWithTimestamp);
            }

            console.log('✅ Lead criado no Supabase:', data);
            return { success: true, data };
        } catch (error) {
            console.error('Erro na criação do lead:', error);
            return this.createLeadFallback(leadWithTimestamp);
        }
    }

    async getLeadByCPF(cpf) {
        if (!this.isConfigured) {
            return this.getLeadByCPFFallback(cpf);
        }

        try {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('cpf', cpf.replace(/[^\d]/g, ''))
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = not found
                console.error('Erro ao buscar lead:', error);
                return this.getLeadByCPFFallback(cpf);
            }

            return { success: true, data: data || null };
        } catch (error) {
            console.error('Erro na busca do lead:', error);
            return this.getLeadByCPFFallback(cpf);
        }
    }

    async updateLeadStage(cpf, etapaAtual) {
        if (!this.isConfigured) {
            return this.updateLeadStageFallback(cpf, etapaAtual);
        }

        try {
            const { data, error } = await supabase
                .from('leads')
                .update({ etapa_atual: etapaAtual })
                .eq('cpf', cpf.replace(/[^\d]/g, ''))
                .select()
                .single();

            if (error) {
                console.error('Erro ao atualizar etapa:', error);
                return this.updateLeadStageFallback(cpf, etapaAtual);
            }

            console.log('✅ Etapa atualizada no Supabase:', data);
            return { success: true, data };
        } catch (error) {
            console.error('Erro na atualização da etapa:', error);
            return this.updateLeadStageFallback(cpf, etapaAtual);
        }
    }

    async updatePaymentStatus(cpf, status) {
        if (!this.isConfigured) {
            return this.updatePaymentStatusFallback(cpf, status);
        }

        try {
            const { data, error } = await supabase
                .from('leads')
                .update({ status_pagamento: status })
                .eq('cpf', cpf.replace(/[^\d]/g, ''))
                .select()
                .single();

            if (error) {
                console.error('Erro ao atualizar status de pagamento:', error);
                return this.updatePaymentStatusFallback(cpf, status);
            }

            console.log('✅ Status de pagamento atualizado no Supabase:', data);
            return { success: true, data };
        } catch (error) {
            console.error('Erro na atualização do status de pagamento:', error);
            return this.updatePaymentStatusFallback(cpf, status);
        }
    }

    async updateLeadTimeline(cpf, timelineData) {
        if (!this.isConfigured) {
            return this.updateLeadTimelineFallback(cpf, timelineData);
        }

        try {
            const { data, error } = await supabase
                .from('leads')
                .update({ 
                    timeline_data: timelineData,
                    updated_at: new Date().toISOString()
                })
                .eq('cpf', cpf.replace(/[^\d]/g, ''))
                .select()
                .single();

            if (error) {
                console.error('Erro ao atualizar timeline:', error);
                return this.updateLeadTimelineFallback(cpf, timelineData);
            }

            console.log('✅ Timeline atualizada no Supabase:', data);
            return { success: true, data };
        } catch (error) {
            console.error('Erro na atualização da timeline:', error);
            return this.updateLeadTimelineFallback(cpf, timelineData);
        }
    }

    // Métodos de fallback usando localStorage
    createLeadFallback(leadData) {
        try {
            const leads = JSON.parse(localStorage.getItem('leads') || '[]');
            const newLead = {
                ...leadData,
                nome_completo: leadData.nome_completo || leadData.nome || 'Cliente Shopee',
                id: Date.now().toString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                initial_timestamp: leadData.initial_timestamp || new Date().toISOString()
            };
            
            console.log('💾 SALVANDO LEAD NO LOCALSTORAGE:', {
                cpf: newLead.cpf,
                nome_completo: newLead.nome_completo,
                initial_timestamp: newLead.initial_timestamp
            });
            
            leads.push(newLead);
            localStorage.setItem('leads', JSON.stringify(leads));
            console.log('✅ Lead criado no localStorage:', newLead);
            return { success: true, data: newLead };
        } catch (error) {
            console.error('Erro no fallback de criação:', error);
            return { success: false, error: error.message };
        }
    }

    getLeadByCPFFallback(cpf) {
        try {
            const leads = JSON.parse(localStorage.getItem('leads') || '[]');
            const lead = leads.find(l => l.cpf === cpf.replace(/[^\d]/g, ''));
            return { success: true, data: lead || null };
        } catch (error) {
            console.error('Erro no fallback de busca:', error);
            return { success: false, error: error.message };
        }
    }

    updateLeadStageFallback(cpf, etapaAtual) {
        try {
            const leads = JSON.parse(localStorage.getItem('leads') || '[]');
            const leadIndex = leads.findIndex(l => l.cpf === cpf.replace(/[^\d]/g, ''));
            
            if (leadIndex !== -1) {
                leads[leadIndex].etapa_atual = etapaAtual;
                leads[leadIndex].updated_at = new Date().toISOString();
                localStorage.setItem('leads', JSON.stringify(leads));
                console.log('✅ Etapa atualizada no localStorage:', leads[leadIndex]);
                return { success: true, data: leads[leadIndex] };
            }
            
            return { success: false, error: 'Lead não encontrado' };
        } catch (error) {
            console.error('Erro no fallback de atualização:', error);
            return { success: false, error: error.message };
        }
    }

    updatePaymentStatusFallback(cpf, status) {
        try {
            const leads = JSON.parse(localStorage.getItem('leads') || '[]');
            const leadIndex = leads.findIndex(l => l.cpf === cpf.replace(/[^\d]/g, ''));
            
            if (leadIndex !== -1) {
                leads[leadIndex].status_pagamento = status;
                leads[leadIndex].updated_at = new Date().toISOString();
                localStorage.setItem('leads', JSON.stringify(leads));
                console.log('✅ Status de pagamento atualizado no localStorage:', leads[leadIndex]);
                return { success: true, data: leads[leadIndex] };
            }
            
            return { success: false, error: 'Lead não encontrado' };
        } catch (error) {
            console.error('Erro no fallback de atualização de pagamento:', error);
            return { success: false, error: error.message };
        }
    }

    updateLeadTimelineFallback(cpf, timelineData) {
        try {
            const leads = JSON.parse(localStorage.getItem('leads') || '[]');
            const leadIndex = leads.findIndex(l => l.cpf === cpf.replace(/[^\d]/g, ''));
            
            if (leadIndex !== -1) {
                leads[leadIndex].timeline_data = timelineData;
                leads[leadIndex].updated_at = new Date().toISOString();
                localStorage.setItem('leads', JSON.stringify(leads));
                console.log('✅ Timeline atualizada no localStorage:', leads[leadIndex]);
                return { success: true, data: leads[leadIndex] };
            }
            
            return { success: false, error: 'Lead não encontrado' };
        } catch (error) {
            console.error('Erro no fallback de atualização de timeline:', error);
            return { success: false, error: error.message };
        }
    }

    updateLiberationStatusFallback(cpf, paid, liberationDate) {
        try {
            const leads = JSON.parse(localStorage.getItem('leads') || '[]');
            const leadIndex = leads.findIndex(l => l.cpf === cpf.replace(/[^\d]/g, ''));
            
            if (leadIndex !== -1) {
                leads[leadIndex].liberation_paid = paid;
                leads[leadIndex].liberation_date = liberationDate || new Date().toISOString();
                leads[leadIndex].updated_at = new Date().toISOString();
                localStorage.setItem('leads', JSON.stringify(leads));
                console.log('✅ Status de liberação atualizado no localStorage:', leads[leadIndex]);
                return { success: true, data: leads[leadIndex] };
            }
            
            return { success: false, error: 'Lead não encontrado' };
        } catch (error) {
            console.error('Erro no fallback de atualização de liberação:', error);
            return { success: false, error: error.message };
        }
    }

    updateDeliveryAttemptsFallback(cpf, attempts) {
        try {
            const leads = JSON.parse(localStorage.getItem('leads') || '[]');
            const leadIndex = leads.findIndex(l => l.cpf === cpf.replace(/[^\d]/g, ''));
            
            if (leadIndex !== -1) {
                leads[leadIndex].delivery_attempts = attempts;
                leads[leadIndex].updated_at = new Date().toISOString();
                localStorage.setItem('leads', JSON.stringify(leads));
                console.log('✅ Tentativas de entrega atualizadas no localStorage:', leads[leadIndex]);
                return { success: true, data: leads[leadIndex] };
            }
            
            return { success: false, error: 'Lead não encontrado' };
        } catch (error) {
            console.error('Erro no fallback de atualização de tentativas:', error);
            return { success: false, error: error.message };
        }
    }
}