document.addEventListener("DOMContentLoaded", function() {
  const pedidoForm = document.getElementById("pedidoForm");
  const pedidoInput = document.getElementById("pedidoInput");
  const listaPedidos = document.getElementById("listaPedidos");
  const listaPedidosFinalizados = document.getElementById("listaPedidosFinalizados");
  const filtroData = document.getElementById("filtroData");
  const filtroNumero = document.getElementById("filtroNumero");
  const aplicarFiltro = document.getElementById("aplicarFiltro");

  const modalConfirmacao = document.getElementById("modalConfirmacao");
  const confirmarBtn = document.getElementById("confirmarBtn");
  const cancelarBtn = document.getElementById("cancelarBtn");

  const notificacaoCriacao = document.getElementById("notificacaoCriacao");
  const notificacaoFinalizacao = document.getElementById("notificacaoFinalizacao");

  let pedidos = [];

  pedidoForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const pedido = {
      numero: pedidoInput.value,
      data: new Date().toISOString(), // Armazenar a data no formato ISO (YYYY-MM-DDTHH:mm:ss)
      status: "ativo"
    };
    pedidos.push(pedido);
    renderizarPedidos();
    pedidoInput.value = "";

    // Exibir notificação de criação
    notificacaoCriacao.style.display = "block";
    setTimeout(() => {
      notificacaoCriacao.style.opacity = 1;
    }, 0);
    setTimeout(() => {
      notificacaoCriacao.style.opacity = 0;
      setTimeout(() => {
        notificacaoCriacao.style.display = "none";
      }, 500);
    }, 3000);
  });

  aplicarFiltro.addEventListener("click", function() {
    const filtroDataValue = filtroData.value;  // Data no formato YYYY-MM-DD
    const filtroNumeroValue = filtroNumero.value.toLowerCase();

    // Filtrar apenas os pedidos finalizados com base na data e no número
    const pedidosFiltrados = pedidos.filter(pedido => {
      if (pedido.status !== "finalizado") return false; // Filtra apenas pedidos finalizados

      // Extrair apenas a parte da data (YYYY-MM-DD) para comparação
      const pedidoData = pedido.data.split('T')[0]; // Pegar apenas a data (YYYY-MM-DD) da string ISO

      // Comparação para data e número
      const dataCorresponde = filtroDataValue ? pedidoData === filtroDataValue : true;
      const numeroCorresponde = filtroNumeroValue ? pedido.numero.toLowerCase().includes(filtroNumeroValue) : true;
      
      return dataCorresponde && numeroCorresponde; // Ambos devem ser verdadeiros
    });

    renderizarPedidos(pedidosFiltrados); // Passar os pedidos filtrados para renderização
  });

  function renderizarPedidos(pedidosParaRenderizar = pedidos) {
    // Limpar as listas
    listaPedidos.innerHTML = '';
    listaPedidosFinalizados.innerHTML = '';

    // Renderizar pedidos ativos
    pedidos.filter(p => p.status === "ativo").forEach(pedido => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="numero"> ${pedido.numero}</span>
        <span class="data-hora">${pedido.data}</span>
        <button class="check">Finalizar</button>
      `;
      li.querySelector(".check").addEventListener("click", function() {
        // Exibir o modal de confirmação para finalizar o pedido
        modalConfirmacao.style.display = "flex";
        // Salvar o pedido selecionado para finalização
        modalConfirmacao.pedido = pedido;
      });
      listaPedidos.appendChild(li);
    });

    // Renderizar pedidos finalizados
    pedidosParaRenderizar.filter(p => p.status === "finalizado").forEach(pedido => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="numero">Pedido n° ${pedido.numero}</span>
        <span class="data-hora">${pedido.data}</span>
      `;
      listaPedidosFinalizados.appendChild(li);
    });
  }

  confirmarBtn.addEventListener("click", function() {
    // Mover o pedido para a lista de finalizados
    if (modalConfirmacao.pedido) {
      modalConfirmacao.pedido.status = "finalizado";
      renderizarPedidos();

      // Exibir notificação de finalização
      notificacaoFinalizacao.style.display = "block";
      setTimeout(() => {
        notificacaoFinalizacao.style.opacity = 1;
      }, 0);
      setTimeout(() => {
        notificacaoFinalizacao.style.opacity = 0;
        setTimeout(() => {
          notificacaoFinalizacao.style.display = "none";
        }, 500);
      }, 3000);
    }

    // Fechar o modal
    modalConfirmacao.style.display = "none";
  });

  cancelarBtn.addEventListener("click", function() {
    // Fechar o modal sem fazer nada
    modalConfirmacao.style.display = "none";
  });
});
