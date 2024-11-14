import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCr6c1Z_7F5GlkHLmXLGA7Th0J0cyYRTl4",
  authDomain: "gestaodepedidos-f33df.firebaseapp.com",
  projectId: "gestaodepedidos-f33df",
  storageBucket: "gestaodepedidos-f33df.firebasestorage.app",
  messagingSenderId: "619455400895",
  appId: "1:619455400895:web:8d897d825613898c01ef0a"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

  async function carregarPedidos() {
    const pedidosRef = collection(db, "pedidos");
    const q = query(pedidosRef);
    const querySnapshot = await getDocs(q);
    pedidos = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    renderizarPedidos();
  }

  carregarPedidos();

  pedidoForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    const pedido = {
      numero: pedidoInput.value,
      data: new Date().toISOString(),
      status: "ativo"
    };

    try {
      const docRef = await addDoc(collection(db, "pedidos"), pedido);
      pedido.id = docRef.id;
      pedidos.push(pedido);
      renderizarPedidos();
      pedidoInput.value = "";

      notificacaoCriacao.style.display = "block";
      setTimeout(() => notificacaoCriacao.style.opacity = 1, 0);
      setTimeout(() => {
        notificacaoCriacao.style.opacity = 0;
        setTimeout(() => notificacaoCriacao.style.display = "none", 500);
      }, 3000);
    } catch (e) {
      console.error("Erro ao adicionar pedido: ", e);
    }
  });

  aplicarFiltro.addEventListener("click", function() {
    const filtroDataValue = filtroData.value;
    const filtroNumeroValue = filtroNumero.value.toLowerCase();

    const pedidosFiltrados = pedidos.filter(pedido => {
      if (pedido.status !== "finalizado") return false;

      const pedidoData = pedido.data.split('T')[0];
      const dataCorresponde = filtroDataValue ? pedidoData === filtroDataValue : true;
      const numeroCorresponde = filtroNumeroValue ? pedido.numero.toLowerCase().includes(filtroNumeroValue) : true;
      
      return dataCorresponde && numeroCorresponde;
    });

    renderizarPedidos(pedidosFiltrados);
  });

  function renderizarPedidos(pedidosParaRenderizar = pedidos) {
    listaPedidos.innerHTML = '';
    listaPedidosFinalizados.innerHTML = '';

    pedidosParaRenderizar.filter(p => p.status === "ativo").forEach(pedido => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="numero">Pedido n° ${pedido.numero}</span>
        <span class="data-hora">${pedido.data}</span>
        <button class="check">Finalizar</button>
      `;
      li.querySelector(".check").addEventListener("click", function() {
        modalConfirmacao.style.display = "flex";
        modalConfirmacao.dataset.acao = "finalizar";
        modalConfirmacao.pedido = pedido;
      });
      listaPedidos.appendChild(li);
    });

    pedidosParaRenderizar.filter(p => p.status === "finalizado").forEach(pedido => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="numero">Pedido n° ${pedido.numero}</span>
        <span class="data-hora">${pedido.data}</span>
        <button class="excluir">Excluir</button>
      `;
      li.querySelector(".excluir").addEventListener("click", function() {
        modalConfirmacao.style.display = "flex";
        modalConfirmacao.dataset.acao = "excluir";
        modalConfirmacao.pedido = pedido;
      });
      listaPedidosFinalizados.appendChild(li);
    });
  }

  confirmarBtn.addEventListener("click", async function() {
    const acao = modalConfirmacao.dataset.acao;
    const pedido = modalConfirmacao.pedido;

    if (acao === "finalizar" && pedido) {
      try {
        pedido.status = "finalizado";
        const pedidoRef = doc(db, "pedidos", pedido.id);
        await updateDoc(pedidoRef, { status: "finalizado" });
        pedidos = pedidos.filter(p => p.id !== pedido.id);
        pedidos.push(pedido);
        renderizarPedidos();

        notificacaoFinalizacao.style.display = "block";
        setTimeout(() => notificacaoFinalizacao.style.opacity = 1, 0);
        setTimeout(() => {
          notificacaoFinalizacao.style.opacity = 0;
          setTimeout(() => notificacaoFinalizacao.style.display = "none", 500);
        }, 3000);
      } catch (e) {
        console.error("Erro ao finalizar pedido:", e);
      }
    } else if (acao === "excluir" && pedido) {
      try {
        const pedidoRef = doc(db, "pedidos", pedido.id);
        await deleteDoc(pedidoRef);
        pedidos = pedidos.filter(p => p.id !== pedido.id);
        renderizarPedidos();
      } catch (e) {
        console.error("Erro ao excluir pedido:", e);
      }
    }

    modalConfirmacao.style.display = "none";
  });

  cancelarBtn.addEventListener("click", function() {
    modalConfirmacao.style.display = "none";
  });
});
