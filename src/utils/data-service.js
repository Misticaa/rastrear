/**
 * Serviço para busca de dados de CPF com fallback
 */
export class DataService {
    constructor() {
        this.fallbackData = this.generateFallbackData();
        console.log('DataService initialized');
    }

    async fetchCPFData(cpf) {
        const cleanCPF = cpf.replace(/[^\d]/g, '');
        console.log('Fetching data for CPF:', cleanCPF);

        try {
            // Try the new API first
            const response = await this.tryNewAPI(cleanCPF);
            if (response) {
                console.log('Data obtained from new API:', response);
                return {
                    DADOS: {
                        nome: response.nome,
                        cpf: cleanCPF,
                        nascimento: response.nascimento || this.generateBirthDate(cleanCPF),
                        situacao: 'REGULAR'
                    }
                };
            }
        } catch (error) {
            console.error('New API failed, using fallback:', error.message);
        }

        // Use fallback data
        console.log('Using fallback data for CPF:', cleanCPF);
        return this.getFallbackData(cleanCPF);
    }

    async tryNewAPI(cpf) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

        try {
            console.log('Calling new API endpoint for CPF:', cpf);
            
            // Use proxy em desenvolvimento, URL direta em produção
            const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const apiUrl = isDevelopment 
                ? `/apela-api/?user=b1b0e7e6-3bd8-4aae-bcb0-2c03940c3ae9&cpf=${cpf}`
                : `https://apela-api.tech/?user=b1b0e7e6-3bd8-4aae-bcb0-2c03940c3ae9&cpf=${cpf}`;
            
            console.log('🌐 Environment:', isDevelopment ? 'Development' : 'Production');
            console.log('🔗 API URL:', apiUrl);
            
            const fetchOptions = {
                signal: controller.signal,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                credentials: 'omit',
                cache: 'no-store'
            };
            
            // Adicionar configurações CORS apenas em produção
            if (!isDevelopment) {
                fetchOptions.mode = 'cors';
                fetchOptions.headers['User-Agent'] = 'Mozilla/5.0 (compatible; TrackingSystem/1.0)';
            } else {
                // Em desenvolvimento, usar CORS para compatibilidade com proxy
                fetchOptions.mode = 'cors';
            }

            console.log('📋 Fetch options:', fetchOptions);
            
            const response = await fetch(apiUrl, fetchOptions);

            clearTimeout(timeoutId);

            console.log('📊 Response status:', response.status, response.statusText);
            console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                console.error(`HTTP Error: ${response.status} - ${response.statusText}`);
                
                // Try to get more details about the error
                let errorDetails = '';
                try {
                    errorDetails = await response.text();
                    console.error('Error response body:', errorDetails);
                } catch (e) {
                    console.error('Could not read error response body:', e);
                }
                
                throw new Error(`API Error: ${response.status} - ${response.statusText}${errorDetails ? ' - ' + errorDetails : ''}`);
            }

            const responseText = await response.text();
            console.log('📄 API Response Text (first 200 chars):', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
            
            if (!responseText || responseText.trim() === '') {
                console.error('Empty response from API');
                throw new Error('Resposta vazia da API');
            }

            try {
                const data = JSON.parse(responseText);
                console.log('📊 Parsed API data:', data);
                
                // Verificar novo formato da API
                if (data && data.status === 200 && data.nome && data.cpf) {
                    console.log('✅ API returned valid data:', {
                        nome: data.nome,
                        cpf: data.cpf,
                        nascimento: data.nascimento,
                        sexo: data.sexo,
                        requisicoes_restantes: data.requisicoes_restantes
                    });
                    return data;
                }
                
                console.error('❌ Invalid data format from API:', data);
                throw new Error('Formato de dados inválido da API');
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                throw new Error('Erro ao processar resposta da API: ' + parseError.message);
            }

        } catch (error) {
            clearTimeout(timeoutId);
            
            // Enhanced error logging
            console.error('❌ API call error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                cause: error.cause,
                timestamp: new Date().toISOString()
            });
            
            // Check for specific error types
            if (error.name === 'AbortError') {
                console.error('⏰ Request was aborted (timeout)');
                throw new Error('Timeout: A API demorou muito para responder');
            } else if (error.message.includes('Failed to fetch')) {
                console.error('🌐 Network error - possibly CORS or connectivity issue');
                throw new Error('Erro de conectividade: Não foi possível acessar a API externa');
            } else if (error.message.includes('CORS')) {
                console.error('🚫 CORS error detected');
                throw new Error('Erro de CORS: API externa não permite acesso do navegador');
            } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                console.error('🔌 DNS/Connection error detected');
                throw new Error('Erro de DNS/Conexão: Servidor não encontrado ou recusou conexão');
            }
            
            throw error;
        }
    }

    getFallbackData(cpf) {
        // Gerar dados realistas baseados no CPF
        const names = [
            'João Silva Santos',
            'Maria Oliveira Costa',
            'Pedro Souza Lima',
            'Ana Paula Ferreira',
            'Carlos Eduardo Alves',
            'Fernanda Santos Rocha',
            'Ricardo Pereira Dias',
            'Juliana Costa Martins',
            'Bruno Almeida Silva',
            'Camila Rodrigues Nunes',
            'Rafael Santos Barbosa',
            'Larissa Oliveira Cruz'
        ];

        const cpfIndex = parseInt(cpf.slice(-2)) % names.length;
        const selectedName = names[cpfIndex];

        console.log('Generated fallback data for CPF:', cpf, 'Name:', selectedName);

        return {
            DADOS: {
                nome: selectedName,
                cpf: cpf,
                nascimento: this.generateBirthDate(cpf),
                situacao: 'REGULAR'
            }
        };
    }

    generateBirthDate(cpf) {
        const year = 1960 + (parseInt(cpf.slice(0, 2)) % 40);
        const month = (parseInt(cpf.slice(2, 4)) % 12) + 1;
        const day = (parseInt(cpf.slice(4, 6)) % 28) + 1;
        
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    }

    generateFallbackData() {
        return {
            products: [
                'Kit 12 caixas organizadoras + brinde',
                'Conjunto de panelas antiaderentes',
                'Smartphone Samsung Galaxy A54',
                'Fone de ouvido Bluetooth',
                'Carregador portátil 10000mAh',
                'Camiseta básica algodão',
                'Tênis esportivo Nike',
                'Relógio digital smartwatch'
            ]
        };
    }
}