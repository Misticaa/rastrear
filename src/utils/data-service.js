/**
 * Serviço para busca de dados de CPF com nova lógica
 */
import { CPFApiService } from '../services/cpf-api-service.js';

export class DataService {
    constructor() {
        this.cpfApiService = new CPFApiService();
        console.log('🚀 DataService inicializado com nova lógica');
    }

    async fetchCPFData(cpf) {
        const cleanCPF = cpf.replace(/[^\d]/g, '');
        console.log('🔍 BUSCANDO DADOS PARA CPF:', cleanCPF);

        try {
            // Usar o novo serviço de API de CPF
            const resultado = await this.cpfApiService.consultarCPF(cleanCPF);
            
            console.log('📊 RESULTADO FINAL DO DATA SERVICE:', resultado);

            // Converter para formato esperado pelo sistema
            return {
                DADOS: {
                    nome: resultado.nome,
                    cpf: resultado.cpf,
                    data_nascimento: resultado.nascimento,
                    sexo: Math.random() > 0.5 ? 'M' : 'F',
                    nome_mae: this.generateMotherName(resultado.nome)
                },
                fonte: resultado.fonte,
                status: resultado.status
            };

        } catch (error) {
            console.error('❌ ERRO NO DATA SERVICE:', error);
            
            // Fallback final
            return this.getFallbackData(cleanCPF);
        }
    }

    getFallbackData(cpf) {
        console.log('⚠️ USANDO FALLBACK FINAL PARA CPF:', cpf);
        
        const names = [
            'JOÃO SILVA SANTOS',
            'MARIA OLIVEIRA COSTA', 
            'PEDRO SOUZA LIMA',
            'ANA PAULA FERREIRA',
            'CARLOS EDUARDO ALVES',
            'FERNANDA SANTOS ROCHA'
        ];

        const cpfIndex = parseInt(cpf.slice(-2)) % names.length;
        const selectedName = names[cpfIndex];

        return {
            DADOS: {
                nome: selectedName,
                cpf: cpf,
                data_nascimento: this.generateBirthDate(cpf),
                sexo: Math.random() > 0.5 ? 'M' : 'F',
                nome_mae: this.generateMotherName(selectedName)
            },
            fonte: 'fallback_final'
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
}