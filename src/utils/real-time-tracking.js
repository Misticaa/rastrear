/**
 * Sistema de rastreamento em tempo real baseado em timestamps
 */
export class RealTimeTrackingSystem {
    constructor() {
        this.trackingSteps = [
            { id: 1, title: "Seu pedido foi criado", description: "Seu pedido foi criado", isChina: false },
            { id: 2, title: "Preparando para envio", description: "O seu pedido está sendo preparado para envio", isChina: false },
            { id: 3, title: "Pedido enviado", description: "[China] O vendedor enviou seu pedido", isChina: true },
            { id: 4, title: "Centro de triagem", description: "[China] O pedido chegou ao centro de triagem de Shenzhen", isChina: true },
            { id: 5, title: "Centro logístico", description: "[China] Pedido saiu do centro logístico de Shenzhen", isChina: true },
            { id: 6, title: "Trânsito internacional", description: "[China] Pedido em trânsito internacional", isChina: true },
            { id: 7, title: "Liberado para exportação", description: "[China] Pedido foi liberado na alfândega de exportação", isChina: true },
            { id: 8, title: "Saiu da origem", description: "Pedido saiu da origem: Shenzhen", isChina: false },
            { id: 9, title: "Chegou no Brasil", description: "Pedido chegou no Brasil", isChina: false },
            { id: 10, title: "Centro de distribuição", description: "Pedido em trânsito para CURITIBA/PR", isChina: false },
            { id: 11, title: "Alfândega de importação", description: "Pedido chegou na alfândega de importação: CURITIBA/PR", isChina: false }
        ];
    }

    /**
     * Gerar timeline baseada em timestamp inicial
     */
    generateTimeline(initialTimestamp, currentTime = new Date()) {
        const timeline = [];
        let currentStepTime = new Date(initialTimestamp);
        const now = currentTime.getTime();

        for (let i = 0; i < this.trackingSteps.length; i++) {
            const step = this.trackingSteps[i];
            
            // Para a primeira etapa, usar o timestamp inicial
            if (i === 0) {
                currentStepTime = new Date(initialTimestamp);
            } else {
                // Adicionar 2 horas + 1-20 minutos aleatórios
                const additionalMinutes = Math.floor(Math.random() * 20) + 1; // 1-20 minutos
                currentStepTime = new Date(currentStepTime.getTime() + (2 * 60 * 60 * 1000) + (additionalMinutes * 60 * 1000));
            }

            // Verificar se o tempo da etapa já passou
            const stepCompleted = currentStepTime.getTime() <= now;

            timeline.push({
                ...step,
                date: new Date(currentStepTime),
                completed: stepCompleted,
                needsLiberation: i === this.trackingSteps.length - 1 && stepCompleted // Última etapa precisa de liberação
            });
        }

        return timeline;
    }

    /**
     * Simular próxima etapa (para admin)
     */
    simulateNextStep(currentTimeline) {
        const nextIncompleteStep = currentTimeline.find(step => !step.completed);
        
        if (nextIncompleteStep) {
            // Marcar como completada e ajustar timestamp para agora
            nextIncompleteStep.completed = true;
            nextIncompleteStep.date = new Date();
            
            console.log('🔄 Etapa simulada:', nextIncompleteStep.title);
            return true;
        }
        
        return false;
    }

    /**
     * Obter status atual do rastreamento
     */
    getCurrentStatus(timeline) {
        const completedSteps = timeline.filter(step => step.completed);
        const lastCompletedStep = completedSteps[completedSteps.length - 1];
        
        if (!lastCompletedStep) {
            return 'Pedido criado';
        }
        
        if (lastCompletedStep.id === this.trackingSteps.length) {
            return 'Aguardando liberação aduaneira';
        }
        
        return lastCompletedStep.description;
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
                console.log('🆕 Nova etapa disponível:', step.title);
            }
        });

        return hasNewSteps;
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