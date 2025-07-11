# Sistema de Rastreamento Shopee Express

## 🔧 Configuração do Supabase

### 1. Configurar Credenciais

Edite o arquivo `src/config/supabase.js` e substitua pelas suas credenciais reais:

```javascript
const supabaseUrl = "https://SEU_PROJETO.supabase.co";
const supabaseKey = "SUA_CHAVE_PUBLICA";
```

### 2. Executar Migrações

No painel do Supabase, execute os seguintes scripts SQL:

1. **Tabela de Consultas**: `supabase/migrations/create_consultas_table.sql`
2. **Tabela de Rastreamentos**: `supabase/migrations/create_rastreamentos_table.sql`

### 3. CPF de Teste

O sistema está configurado para usar o CPF de teste: `011.011.011-05`

Você pode alterar dinamicamente pela interface ou modificar em `src/services/cpf-api-service.js`

## 🚀 Funcionalidades

### ✅ Consulta de CPF
- Verifica se já existe consulta salva no Supabase
- Se nome incorreto ou dados incompletos → força nova consulta na API
- Salva/atualiza dados no Supabase automaticamente

### ✅ Fluxo de Rastreamento
- **Etapas 1-10**: Automáticas com timers (2h + 1-20min aleatórios)
- **Etapa 11**: Botão "Liberar Objeto" (R$ 26,34)
- **Etapas 12-15**: Pós-taxa com timers reais
- **Loop 16-21**: Tentativas infinitas (R$ 7,74 → R$ 12,38 → R$ 16,46)

### ✅ Integração Zentra Pay
- QR Code real para pagamentos
- PIX funcional com chave copia e cola
- Simulação de pagamento para testes

## 🧪 Teste

Acesse: `https://shopeeexpressrastreio.netlify.app/rastreamento.html?focus=cpf&cpf=01101101105`

## 📊 Logs de Debug

O sistema inclui logs detalhados para verificar:
- Consultas na API
- Dados salvos no Supabase
- Nomes exibidos na interface
- Fluxo de etapas e timers

Verifique o console do navegador para acompanhar o funcionamento.