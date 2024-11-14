document.addEventListener("DOMContentLoaded", function() {
  const pedidoForm = document.getElementById("pedidoForm");
  const pedidoInput = document.getElementById("pedidoInput");
  const listaPedidos = document.getElementById("listaPedidos");
  const listaPedidosFinalizados = document.getElementById("listaPedidosFinalizados");
  const filtroData = document.getElementById("filtroData");
  const filtroNumero = document.getElementById("filtroNumero");
  const aplicarFiltro = document.getElementById("aplicarFiltro");

  let pedidosFinalizados = [];

  pedidoForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const numeroPedido = pedidoInput.value.trim();
    if (numeroPedido) {
      const dataHora = new Date();
      adicionarPedido(numeroPedido, dataHora);
      pedidoInput.value = "";
    }
  });

  aplicarFiltro.addEventListener("click", function() {
    const dataFiltro = filtroData.value;
    const numeroFiltro = filtroNumero.value.trim();
    
    listaPedidosFinalizados.innerHTML = "";

    const pedidosFiltrados = pedidosFinalizados.filter(pedido => {
      const { numero, dataHora } = pedido;
      const dataPedido = dataHora.toISOString().split("T")[0];
      
      return (
        (!dataFiltro || dataPedido === dataFiltro) &&
        (!numeroFiltro || numero.includes(numeroFiltro))
      );
    });

    pedidosFiltrados.forEach(({ numero, dataHora }) => {
      const li = criarElementoPedido(numero, dataHora);
      listaPedidosFinalizados.appendChild(li);
    });
  });

  function adicionarPedido(numero, dataHora) {
    const li = criarElementoPedido(numero, dataHora);

    const checkButton = document.createElement("button");
    checkButton.textContent = "Finalizar";
    checkButton.classList.add("check");
    checkButton.addEventListener("click", function() {
      listaPedidosFinalizados.appendChild(li);
      pedidosFinalizados.push({ numero, dataHora });
      checkButton.remove();
    });

    li.appendChild(checkButton);
    listaPedidos.appendChild(li);
  }

  function criarElementoPedido(numero, dataHora) {
    const li = document.createElement("li");
    const dataHoraFormatada = dataHora.toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
    li.innerHTML = `<span class="numero">Pedido #${numero}</span><span class="data-hora">${dataHoraFormatada}</span>`;
    return li;
  }
});
