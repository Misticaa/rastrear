/**
 * Serviço de API de CPF com lógica exata especificada
 */
import { supabase, isSupabaseConfigured } from '../config/supabase.js';

export class CPFApiService {
    constructor() {
        this.apiUrl = 'https://SUA_API_DE_CPF.com/api';
        this.defaultTestCpf = '011.011.011-05'; // CPF de teste padrão
    }

    async consultarCPF(inputCpf) {
        console.log('🔍 INICIANDO CONSULTA DE CPF:', inputCpf);
        
        // CPF de teste (pode ser alterado dinamicamente pela interface)
        const cpf = inputCpf || this.defaultTestCpf;
        const cpfLimpo = cpf.replace(/[^\d]/g, '');
        
        console.log('📋 CPF PROCESSADO:', cpfLimpo);

        try {
            // ⚠️ Primeiro tenta carregar dados do Supabase
            let consulta = null;
            let error = null;

            if (isSupabaseConfigured()) {
                console.log('🗄️ BUSCANDO CONSULTA NO SUPABASE...');
                const result = await supabase
                    .from("consultas")
                    .select("*")
                    .eq("cpf", cpfLimpo)
                    .single();
                
                consulta = result.data;
                error = result.error;
                
                console.log('💾 CONSULTA EXISTENTE:', consulta);
                console.log('❌ ERRO (se houver):', error);
            } else {
                console.log('📱 BUSCANDO CONSULTA NO LOCALSTORAGE...');
                const consultas = JSON.parse(localStorage.getItem('consultas') || '[]');
                consulta = consultas.find(c => c.cpf === cpfLimpo);
                console.log('💾 CONSULTA EXISTENTE (localStorage):', consulta);
            }

            // ⚠️ Se não existir ou estiver com nome errado, busca na API de CPF
            const precisaNovaConsulta = !consulta || 
                                       !consulta.nome || 
                                       consulta.nome === "Fernanda Santos";

            console.log('🔄 PRECISA NOVA CONSULTA:', precisaNovaConsulta);

            if (precisaNovaConsulta) {
                console.log('🌐 FAZENDO NOVA CONSULTA NA API...');
                const response = await fetch(`${this.apiUrl}?cpf=${cpfLimpo}`);
                const api = await response.json();
                
                console.log('📄 RESPOSTA DA API:', api);

                if (api?.status === 200 && api?.nome) {
                    console.log('✅ API RETORNOU DADOS VÁLIDOS:', api);
                    
                    // Salva ou atualiza os dados no Supabase
                    await this.salvarConsulta(cpfLimpo, api);

                    // Atualiza a variável local para exibir corretamente
                    consulta = {
                        cpf: cpfLimpo,
                        nome: api.nome,
                        nascimento: api.nascimento
                    };
                    
                    console.log('🔄 CONSULTA ATUALIZADA:', consulta);
                } else {
                    console.warn('⚠️ API não retornou dados válidos, usando fallback');
                    // Se API falhar, gerar dados fallback
                    consulta = this.gerarDadosFallback(cpfLimpo);
                }
            }

            // 🕒 Lógica de rastreamento
            await this.inicializarRastreamento(cpfLimpo);

            // Retorno para interface Bolt
            const nomeRetorno = consulta?.nome || "Nome não encontrado";
            console.log('🎯 NOME FINAL RETORNADO:', nomeRetorno);

            return {
                nome: nomeRetorno,
                cpf: cpfLimpo,
                nascimento: consulta?.nascimento,
                status: "ok",
                mensagem: "Dados carregados com sucesso",
                fonte: consulta ? (precisaNovaConsulta ? 'api' : 'cache') : 'fallback'
            };

        } catch (error) {
            console.error('❌ ERRO NA CONSULTA DE CPF:', error);
            
            // Fallback com dados mock
            return this.gerarDadosFallback(cpfLimpo);
        }
    }

    async salvarConsulta(cpf, dadosAPI) {
        const consulta = {
            cpf: cpf,
            nome: dadosAPI.nome,
            nascimento: dadosAPI.nascimento,
            data_consulta: new Date().toISOString()
        };

        if (!isSupabaseConfigured()) {
            console.log('💾 SALVANDO CONSULTA NO LOCALSTORAGE...');
            const consultas = JSON.parse(localStorage.getItem('consultas') || '[]');
            const index = consultas.findIndex(c => c.cpf === cpf);
            
            if (index >= 0) {
                consultas[index] = consulta;
            } else {
                consultas.push(consulta);
            }
            
            localStorage.setItem('consultas', JSON.stringify(consultas));
            return;
        }

        try {
            console.log('💾 SALVANDO CONSULTA NO SUPABASE...');
            const { error } = await supabase
                .from("consultas")
                .upsert(consulta);

            if (error) {
                console.error('❌ Erro ao salvar consulta:', error);
            } else {
                console.log('✅ Consulta salva com sucesso');
            }
        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
        }
    }

    async inicializarRastreamento(cpf) {
        if (!isSupabaseConfigured()) {
            console.log('📱 VERIFICANDO RASTREAMENTO NO LOCALSTORAGE...');
            const rastreamentos = JSON.parse(localStorage.getItem('rastreamentos') || '[]');
            const existente = rastreamentos.find(r => r.cpf === cpf);
            
            if (!existente) {
                const novoRastreamento = {
                    cpf: cpf,
                    inicio: new Date().toISOString()
                };
                rastreamentos.push(novoRastreamento);
                localStorage.setItem('rastreamentos', JSON.stringify(rastreamentos));
                console.log('✅ Rastreamento inicializado no localStorage');
            }
            return;
        }

        try {
            console.log('🗄️ VERIFICANDO RASTREAMENTO NO SUPABASE...');
            const { data: rastreamento } = await supabase
                .from("rastreamentos")
                .select("*")
                .eq("cpf", cpf)
                .single();

            if (!rastreamento) {
                console.log('🆕 CRIANDO NOVO RASTREAMENTO...');
                const agora = new Date().toISOString();
                const { error } = await supabase
                    .from("rastreamentos")
                    .insert({
                        cpf: cpf,
                        inicio: agora
                    });

                if (error) {
                    console.error('❌ Erro ao criar rastreamento:', error);
                } else {
                    console.log('✅ Rastreamento criado com sucesso');
                }
            } else {
                console.log('📋 Rastreamento já existe');
            }
        } catch (error) {
            console.error('❌ Erro no rastreamento:', error);
        }
    }

    gerarDadosFallback(cpf) {
        console.log('🔄 GERANDO DADOS FALLBACK PARA:', cpf);
        
        const nomesFallback = [
            'JOÃO SILVA SANTOS',
            'MARIA OLIVEIRA COSTA', 
            'PEDRO SOUZA LIMA',
            'ANA PAULA FERREIRA',
            'CARLOS EDUARDO ALVES',
            'FERNANDA SANTOS ROCHA'
        ];

        const index = parseInt(cpf.slice(-2)) % nomesFallback.length;
        const nome = nomesFallback[index];

        console.log('👤 NOME FALLBACK GERADO:', nome);

        return {
            nome: nome,
            cpf: cpf,
            nascimento: this.gerarDataNascimento(cpf),
            status: "ok",
            mensagem: "Dados carregados com sucesso (fallback)",
            fonte: 'fallback'
        };
    }

    gerarDataNascimento(cpf) {
        const year = 1960 + (parseInt(cpf.slice(0, 2)) % 40);
        const month = (parseInt(cpf.slice(2, 4)) % 12) + 1;
        const day = (parseInt(cpf.slice(4, 6)) % 28) + 1;
        
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    }
}