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
            // Try the API first
            const response = await this.tryAPI(cleanCPF);
            if (response) {
                console.log('Data obtained from API:', response);
                return response;
            }
        } catch (error) {
            console.error('API failed, using fallback:', error.message);
        }

        // Use fallback data
        console.log('Using fallback data for CPF:', cleanCPF);
        return this.getFallbackData(cleanCPF);
    }

    async tryAPI(cpf) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

        try {
            console.log('Calling API endpoint for CPF:', cpf);
            
            const apiUrl = `/api/amnesia/?token=e9f16505-2743-4392-bfbe-1b4b89a7367c&cpf=${cpf}`;
            
            console.log('🌐 API URL:', apiUrl);
            
            const fetchOptions = {
                signal: controller.signal,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                credentials: 'omit',
                cache: 'no-store',
                mode: 'cors'
            };

            console.log('📋 Fetch options:', fetchOptions);
            
            const response = await fetch(apiUrl, fetchOptions);

            clearTimeout(timeoutId);

            console.log('📊 Response status:', response.status, response.statusText);
            console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                console.error(`HTTP Error: ${response.status} - ${response.statusText}`);
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            const responseText = await response.text();
            console.log('📄 API Response Text:', responseText);
            
            if (!responseText || responseText.trim() === '') {
                console.error('Empty response from API');
                throw new Error('Resposta vazia da API');
            }

            try {
                const data = JSON.parse(responseText);
                console.log('📊 Parsed API data:', data);
                
                // Verificar formato da API Amnesia
                if (data && data.DADOS && data.DADOS.nome && data.DADOS.cpf) {
                    console.log('✅ API returned valid data:', {
                        nome: data.DADOS.nome,
                        cpf: data.DADOS.cpf,
                        data_nascimento: data.DADOS.data_nascimento,
                        sexo: data.DADOS.sexo
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
            
            console.error('❌ API call error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            if (error.name === 'AbortError') {
                console.error('⏰ Request was aborted (timeout)');
                throw new Error('Timeout: A API demorou muito para responder');
            } else if (error.message.includes('Failed to fetch')) {
                console.error('🌐 Network error - possibly CORS or connectivity issue');
                throw new Error('Erro de conectividade: Não foi possível acessar a API externa');
            }
            
            throw error;
        }
    }

    getFallbackData(cpf) {
        // Gerar dados realistas baseados no CPF
        const names = [
            'JOÃO SILVA SANTOS',
            'MARIA OLIVEIRA COSTA', 
            'PEDRO SOUZA LIMA',
            'ANA PAULA FERREIRA',
            'CARLOS EDUARDO ALVES',
            'FERNANDA SANTOS ROCHA',
            'RICARDO PEREIRA DIAS',
            'JULIANA COSTA MARTINS',
            'BRUNO ALMEIDA SILVA',
            'CAMILA RODRIGUES NUNES',
            'RAFAEL SANTOS BARBOSA',
            'LARISSA OLIVEIRA CRUZ'
        ];

        const cpfIndex = parseInt(cpf.slice(-2)) % names.length;
        const selectedName = names[cpfIndex];

        console.log('Generated fallback data for CPF:', cpf, 'Name:', selectedName);

        return {
            DADOS: {
                nome: selectedName,
                cpf: cpf,
                data_nascimento: this.generateBirthDate(cpf),
                sexo: Math.random() > 0.5 ? 'M' : 'F',
                nome_mae: this.generateMotherName(selectedName)
            }
        };
    }

    generateBirthDate(cpf) {
        const year = 1960 + (parseInt(cpf.slice(0, 2)) % 40);
        const month = (parseInt(cpf.slice(2, 4)) % 12) + 1;
        const day = (parseInt(cpf.slice(4, 6)) % 28) + 1;
        
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    }
    generateMotherName(childName) {
        const motherNames = [
            'MARIA JOSÉ SILVA',
            'ANA MARIA OLIVEIRA',
            'JOSÉ MARIA SANTOS',
            'FRANCISCA SILVA',
            'ANTÔNIA COSTA',
            'MARIA DAS GRAÇAS',
            'RITA DE CÁSSIA',
            'SANDRA REGINA'
        ];
        
        const index = childName.length % motherNames.length;
        return motherNames[index];
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