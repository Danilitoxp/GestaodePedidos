// Lógica de acompanhamento de pedidos com avisos sonoros

if (!window.__avisados) window.__avisados = new Set();
if (window.__somAtivo === undefined) window.__somAtivo = true;

const btn = document.getElementById("toggle-audio");
const icone = document.getElementById("icone-audio");

if (btn && icone) {
    btn.addEventListener("click", () => {
        window.__somAtivo = !window.__somAtivo;
        icone.textContent = window.__somAtivo ? "headphones" : "headset_off";
        console.log("Som agora está:", window.__somAtivo ? "ATIVADO" : "DESATIVADO");
    });
}

function getStatusAndProgress(descricaoItem) {
    const status = (descricaoItem || "").toUpperCase();

    if (status.includes("FATURADO")) return { status: "FATURADO", progresso: 100 };
    if (status.includes("AGUARDANDO SEPARAÇÃO")) return { status: "AG_SEPARACAO", progresso: 10 };
    if (status.includes("SEPARANDO")) return { status: "SEPARANDO", progresso: 30 };
    if (status.includes("AGUARDANDO CONFERÊNCIA")) return { status: "AG_CONFERENCIA", progresso: 50 };
    if (status.includes("CONFERÊNCIA") || status.includes("CONFERINDO")) return { status: "CONFERINDO", progresso: 70 };
    if (status.includes("AGUARDANDO FATURAMENTO")) return { status: "AG_FATURAMENTO", progresso: 90 };

    return { status: "AG_SEPARACAO", progresso: 10 };
}

function getDescricaoAmigavel(descricao) {
    const desc = (descricao || "").toUpperCase();

    if (desc.includes("FATURADO")) return "Pedido Retirado";
    if (desc.includes("AGUARDANDO SEPARAÇÃO")) return "Em Fila pra Separar";
    if (desc.includes("SEPARANDO")) return "Separando Produtos";
    if (desc.includes("AGUARDANDO CONFERÊNCIA")) return "Em Fila pra Conferência";
    if (desc.includes("CONFERÊNCIA") || desc.includes("CONFERINDO")) return "Conferindo";
    if (desc.includes("AGUARDANDO FATURAMENTO")) return "Pronto pra Retirar";
    return "Status Desconhecido";
}

function criarCardPedido(pedido) {
    let nome = pedido.cliente?.nome || "Cliente desconhecido";

    if (nome.toUpperCase().includes("CONSUMIDOR") && pedido.nomeConsumidor) {
        nome = pedido.nomeConsumidor;
    }

    const numero = pedido.numeroDocumento || "Sem número";
    const hora = pedido.horaEntrada?.slice(0, 5) || "—";
    const statusDesc = pedido.itens?.[0]?.descricao || "Status desconhecido";

    const { status, progresso } = getStatusAndProgress(statusDesc);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <h2>${nome}</h2>
        <small>Pedido Nº: ${numero} - ${hora}</small><br>
        <small>Itens: ${pedido.itens.length}</small>
        <div class="status-bar status-${status}">${getDescricaoAmigavel(statusDesc)}</div>
        <div class="progress-bar">
           <div class="progress-bar-fill status-${status}" style="width: ${progresso}%; transition: width 0.3s ease;"></div>
        </div>
        <div class="progress-wizard">
          <div class="step ${progresso >= 10 ? 'done' : ''}">
            <div class="circle"><span class="material-icons">${progresso >= 10 ? 'check' : 'inventory_2'}</span></div>
            <div class="label">Separação</div>
          </div>
          <div class="line"></div>
          <div class="step ${progresso >= 30 ? 'done' : ''}">
            <div class="circle"><span class="material-icons">${progresso >= 30 ? 'check' : 'local_shipping'}</span></div>
            <div class="label">Separando</div>
          </div>
          <div class="line"></div>
          <div class="step ${progresso >= 50 ? 'done' : ''}">
            <div class="circle"><span class="material-icons">${progresso >= 50 ? 'check' : 'fact_check'}</span></div>
            <div class="label">Conferência</div>
          </div>
          <div class="line"></div>
          <div class="step ${progresso >= 70 ? 'done' : ''}">
            <div class="circle"><span class="material-icons">${progresso >= 70 ? 'check' : 'shopping_bag'}</span></div>
            <div class="label">Pronto</div>
          </div>
        </div>
    `;

    if (status === "AG_FATURAMENTO") {
        const nomeCurto = nome.split(" ").slice(0, 2).join(" ");
        const mensagem = `Atenção ${nomeCurto}, seu pedido está pronto para retirada.`;

        if (!window.__avisados.has(numero) && window.__somAtivo) {
            window.__avisados.add(numero);
            const fala = new SpeechSynthesisUtterance(mensagem);
            fala.lang = 'pt-BR';
            fala.pitch = 1.1;
            fala.rate = 0.95;
            fala.volume = 1;

            const esperarEFalar = () => {
                if (!window.__somAtivo) {
                    window.speechSynthesis.cancel();
                    return;
                }

                if (!window.speechSynthesis.speaking) {
                    window.speechSynthesis.speak(fala);
                } else {
                    setTimeout(esperarEFalar, 300);
                }
            };

            esperarEFalar();
        }
    }

    card.addEventListener("click", () => {
        alert(`\nPedido: ${numero}\nCliente: ${nome}\nData Entrada: ${pedido.dataEntrada}\nHora Entrada: ${pedido.horaEntrada}\nEntrega/Retira: ${pedido.entregaRetira}\nLocal Retira: ${pedido.todosLocaisDeRetiraNoPedido}\nLiberado Comercial: ${pedido.liberacaoComercial}\nPedido Liberado: ${pedido.pedidoLiberado}\nCancelado: ${pedido.cancelado}\nStatus (1º item): ${statusDesc}\nTotal de Itens: ${pedido.itens?.length}\nItens com status SEPARANDO: ${pedido.itens?.filter(i => (i.descricao || "").toUpperCase() === "SEPARANDO").length}`);
    });

    return card;
}

function aplicarFiltros(pedidos, hoje) {
    return pedidos.filter(p =>
        p.especieDocumento?.trim().toUpperCase() === "PD" &&
        p.entregaRetira?.trim().toLowerCase() === "retira" &&
        p.todosLocaisDeRetiraNoPedido?.trim().toLowerCase() === "balcão" &&
        p.dataEntrada?.startsWith(hoje) &&
        p.liberacaoComercial === true &&
        p.pedidoLiberado === true &&
        p.cancelado === false &&
        Array.isArray(p.itens) &&
        p.itens.length > 0
    );
}

function ajustarTamanhoDosCards(qtdPedidos) {
    const root = document.documentElement;
    let tamanhoMin = 180;
    let tamanhoMax = 320;
    let cardWidth = Math.max(tamanhoMin, Math.min(tamanhoMax, Math.floor(window.innerWidth / (qtdPedidos / 2))));
    root.style.setProperty('--largura-card', `${cardWidth}px`);
}

async function getStatusReal(numero, especie, empresa) {
    const baseURL = "http://144.22.215.1:10150";
    const url = `${baseURL}/pedido/${numero}/${especie}/${empresa}/status`;

    try {
        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Basic VEVTVEU6MTIz"
            }
        });

        if (!res.ok) {
            console.warn(`Status ${res.status} para pedido ${numero}`);
            return null;
        }

        const data = await res.json();
        return data.descricao || null;
    } catch (err) {
        console.error(`Erro ao buscar status do pedido ${numero}:`, err);
        return null;
    }
}

async function carregarPedidos() {
    try {
        const res = await fetch("http://localhost:3001/api/pedidos");
        const json = await res.json();
        const hoje = new Date().toISOString().slice(0, 10);

        let pedidos = aplicarFiltros(json.content || [], hoje);
        pedidos.sort((a, b) => (b.horaEntrada || "00:00:00").localeCompare(a.horaEntrada || "00:00:00"));

        await Promise.all(pedidos.map(async pedido => {
            const numero = pedido.numeroDocumento;
            const especie = pedido.especieDocumento;
            const empresa = pedido.empresa || "001";

            const statusReal = await getStatusReal(numero, especie, empresa);
            if (statusReal) {
                pedido.itens[0].descricao = statusReal;
            } else {
                pedido.itens[0].descricao = "Status não encontrado";
            }
        }));

        document.getElementById("contador").textContent = `Total de pedidos: ${pedidos.length}`;
        ajustarTamanhoDosCards(pedidos.length);

        const horaAtual = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        document.getElementById("ultima-atualizacao").textContent = `Última atualização: ${horaAtual}`;

        const lista = document.getElementById("lista-pedidos");
        lista.innerHTML = "";

        pedidos.forEach(pedido => lista.appendChild(criarCardPedido(pedido)));
    } catch (error) {
        console.error("Erro no fetch:", error);
        document.getElementById("contador").textContent = "Erro ao carregar pedidos 😢";
    }
}

carregarPedidos();
setInterval(carregarPedidos, 5000);
