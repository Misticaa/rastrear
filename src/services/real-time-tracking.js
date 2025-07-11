/**
 * Sistema de rastreamento em tempo real baseado em timestamp inicial
 */
export class RealTimeTrackingService {
    constructor() {
        this.trackingSteps = [
            { id: 1, title: "Seu pedido foi criado", description: "Seu pedido foi criado", isChina: false },
            { id: 2, title: "Preparando para envio", description: "Seu pedido está sendo preparado para envio", isChina: false },
            { id: 3, title: "Pedido enviado", description: "[China] O vendedor enviou seu pedido", isChina: true },
            { id: 4, title: "Centro de triagem", description: "[China] O pedido chegou ao centro de triagem de Shenzhen", isChina: true },
            { id: 5, title: "Centro logístico", description: "[China] Pedido saiu do centro logístico de Shenzhen", isChina: true },
            { id: 6, title: "Trânsito internacional", description: "[China] Coletado. O pedido está em trânsito internacional", isChina: true },
            { id: 7, title: "Liberado para exportação", description: "[China] O pedido foi liberado na alfândega de exportação", isChina: true },
            { id: 8, title: "Saiu da origem", description: "Pedido saiu da origem: Shenzhen", isChina: false },
            { id: 9, title: "Chegou no Brasil", description: "Pedido chegou no Brasil", isChina: false },
            { id: 10, title: "Alfândega de importação", description: "Pedido chegou na alfândega de importação: Curitiba/PR", isChina: false }
        ];
        
        this.deliveryValues = [7.74, 12.38, 16.46];
    }

    /**
     * Gerar timeline baseada no timestamp inicial salvo no Supabase
     */
    generateTimeline(initialTimestamp, currentTime = new Date(), liberationPaid = false, deliveryAttempts = 0) {
        const timeline = [];
        const startTime = new Date(initialTimestamp);
        const now = currentTime.getTime();

        // Etapas 1-10: Automáticas (2h + 1-20min aleatórios)
        for (let i = 0; i < this.trackingSteps.length; i++) {
            const step = this.trackingSteps[i];
            let stepTime;

            if (i === 0) {
                // Primeira etapa usa o timestamp inicial
                stepTime = new Date(startTime);
            } else {
                // Próximas etapas: 2h + 1-20min aleatórios
                const previousStepTime = timeline[i - 1].date;
                const additionalMinutes = Math.floor(Math.random() * 20) + 1; // 1-20 minutos
                stepTime = new Date(previousStepTime.getTime() + (2 * 60 * 60 * 1000) + (additionalMinutes * 60 * 1000));
            }

            const stepCompleted = stepTime.getTime() <= now;

            timeline.push({
                ...step,
                date: stepTime,
                completed: stepCompleted,
                needsLiberation: i === this.trackingSteps.length - 1 && stepCompleted && !liberationPaid,
                showLiberationButton: i === this.trackingSteps.length - 1 && stepCompleted && !liberationPaid
            });
        }

        // Etapas pós-pagamento se a taxa foi paga
        if (liberationPaid) {
            this.addPostPaymentSteps(timeline, deliveryAttempts, now);
        }

        return timeline;
    }

    /**
     * Adicionar etapas pós-pagamento e loop de tentativas
     */
    addPostPaymentSteps(timeline, deliveryAttempts, currentTime) {
        const lastStep = timeline[timeline.length - 1];
        const liberationTime = lastStep.liberationDate || new Date(currentTime);

        // Etapa 11: Pedido liberado (imediato após pagamento)
        timeline.push({
            id: 11,
            title: "Pedido liberado",
            description: "Pedido liberado na alfândega",
            date: new Date(liberationTime),
            completed: true,
            isPostPayment: true
        });

        // Etapa 12: Sairá para entrega (30s depois)
        const step12Time = new Date(liberationTime.getTime() + 30 * 1000);
        timeline.push({
            id: 12,
            title: "Sairá para entrega",
            description: "Pedido sairá para entrega a qualquer momento, aguarde",
            date: step12Time,
            completed: step12Time.getTime() <= currentTime,
            isPostPayment: true
        });

        // Etapa 13: Em trânsito (10min depois)
        const step13Time = new Date(liberationTime.getTime() + 10 * 60 * 1000);
        timeline.push({
            id: 13,
            title: "Em trânsito",
            description: "Pedido em trânsito",
            date: step13Time,
            completed: step13Time.getTime() <= currentTime,
            isPostPayment: true
        });

        // Etapa 14: Em rota (45min depois)
        const step14Time = new Date(liberationTime.getTime() + 45 * 60 * 1000);
        timeline.push({
            id: 14,
            title: "Em rota de entrega",
            description: "Pedido em rota de entrega",
            date: step14Time,
            completed: step14Time.getTime() <= currentTime,
            isPostPayment: true
        });

        // Loop de tentativas de entrega
        this.addDeliveryAttempts(timeline, deliveryAttempts, liberationTime, currentTime);
    }

    /**
     * Adicionar loop infinito de tentativas de entrega
     */
    addDeliveryAttempts(timeline, deliveryAttempts, liberationTime, currentTime) {
        const baseDeliveryTime = new Date(liberationTime.getTime() + 2 * 60 * 60 * 1000); // 2h após liberação

        for (let attempt = 0; attempt <= deliveryAttempts; attempt++) {
            const attemptTime = new Date(baseDeliveryTime.getTime() + (attempt * 3 * 60 * 60 * 1000)); // 3h entre tentativas
            const attemptNumber = (attempt % 3) + 1; // 1, 2, 3, 1, 2, 3...
            const value = this.deliveryValues[attemptNumber - 1];

            // Tentativa de entrega
            timeline.push({
                id: 15 + (attempt * 2),
                title: `Tentativa de entrega ${attemptNumber}°`,
                description: `${attemptNumber}ª tentativa de entrega realizada, mas não foi possível entregar`,
                date: attemptTime,
                completed: attemptTime.getTime() <= currentTime,
                isDeliveryAttempt: true,
                attemptNumber: attemptNumber,
                value: value,
                needsDeliveryPayment: attemptTime.getTime() <= currentTime && attempt === deliveryAttempts
            });

            // Se há próxima tentativa paga, adicionar "liberado para entrega"
            if (attempt < deliveryAttempts) {
                timeline.push({
                    id: 16 + (attempt * 2),
                    title: "Pedido liberado para entrega",
                    description: "Pedido liberado para entrega",
                    date: new Date(attemptTime.getTime() + 30 * 1000),
                    completed: true,
                    isPostPayment: true
                });
            }
        }
    }

    /**
     * Simular próxima etapa (para testes)
     */
    simulateNextStep(timeline) {
        const nextStep = timeline.find(step => !step.completed);
        if (nextStep) {
            nextStep.completed = true;
            nextStep.date = new Date();
            return nextStep;
        }
        return null;
    }

    /**
     * Verificar se há novas etapas disponíveis
     */
    checkForNewSteps(timeline, currentTime = new Date()) {
        const now = currentTime.getTime();
        let hasNewSteps = false;

        timeline.forEach(step => {
            if (!step.completed && step.date.getTime() <= now) {
                step.completed = true;
                hasNewSteps = true;
            }
        });

        return hasNewSteps;
    }

    /**
     * Obter status atual
     */
    getCurrentStatus(timeline) {
        const completedSteps = timeline.filter(step => step.completed);
        const lastStep = completedSteps[completedSteps.length - 1];
        
        if (!lastStep) return 'Pedido criado';
        
        if (lastStep.needsLiberation) {
            return 'Aguardando liberação aduaneira';
        }
        
        if (lastStep.needsDeliveryPayment) {
            return `Aguardando pagamento da ${lastStep.attemptNumber}ª tentativa`;
        }
        
        return lastStep.description;
    }

    /**
     * Formatar data para exibição
     */
    formatDate(date) {
        return {
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
    }
}