import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCr6c1Z_7F5GlkHLmXLGA7Th0J0cyYRTl4",
  authDomain: "gestaodepedidos-f33df.firebaseapp.com",
  projectId: "gestaodepedidos-f33df",
  storageBucket: "gestaodepedidos-f33df.firebasestorage.app",
  messagingSenderId: "619455400895",
  appId: "1:619455400895:web:8d897d825613898c01ef0a"
};

// Initialize Firebase
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

  // Função para carregar pedidos do Firestore
async function carregarPedidos() {
  const pedidosRef = collection(db, "pedidos");
  const q = query(pedidosRef); // Não filtra por status, carrega todos os pedidos
  const querySnapshot = await getDocs(q);
  pedidos = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })); // Inclui o ID do pedido
  renderizarPedidos();
}


  // Carregar os pedidos ao iniciar
  carregarPedidos();

  pedidoForm.addEventListener("submit", async function(e) {
    e.preventDefault();
    const pedido = {
      numero: pedidoInput.value,
      data: new Date().toISOString(),
      status: "ativo"
    };
  
    // Salvar pedido no Firestore e obter a referência do documento
    try {
      const docRef = await addDoc(collection(db, "pedidos"), pedido);
      pedido.id = docRef.id; // Atribuir o ID do pedido ao objeto pedido após a criação no Firestore
      pedidos.push(pedido); // Atualizar a lista local
      renderizarPedidos(); // Atualizar a renderização
  
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
    } catch (e) {
      console.error("Erro ao adicionar pedido: ", e);
    }
  });
  
  

  aplicarFiltro.addEventListener("click", function() {
    const filtroDataValue = filtroData.value;  // Data no formato YYYY-MM-DD
    const filtroNumeroValue = filtroNumero.value.toLowerCase();

    // Filtrar pedidos finalizados com base na data e no número
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

    // Renderiza pedidos ativos (em análise)
    pedidosParaRenderizar.filter(p => p.status === "ativo").forEach(pedido => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="numero">Pedido n° ${pedido.numero}</span>
            <span class="data-hora">${pedido.data}</span>
            <button class="check">Finalizar</button>
        `;
        li.querySelector(".check").addEventListener("click", function() {
            modalConfirmacao.style.display = "flex";
            modalConfirmacao.pedido = pedido;
        });
        listaPedidos.appendChild(li);
    });

    // Renderiza pedidos finalizados
    pedidosParaRenderizar.filter(p => p.status === "finalizado").forEach(pedido => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="numero">Pedido n° ${pedido.numero}</span>
            <span class="data-hora">${pedido.data}</span>
        `;
        listaPedidosFinalizados.appendChild(li);
    });
}

  confirmarBtn.addEventListener("click", async function() {
    if (modalConfirmacao.pedido) {
      console.log("Pedido a ser finalizado:", modalConfirmacao.pedido); // Verificação do pedido
  
      if (!modalConfirmacao.pedido.id) {
        console.error("ID do pedido inválido.");
        return;
      }
  
      modalConfirmacao.pedido.status = "finalizado";
  
      const pedidoRef = doc(db, "pedidos", modalConfirmacao.pedido.id);
      console.log("Referência do pedido:", pedidoRef); // Verificação da referência
  
      try {
        // Atualiza o status do pedido para finalizado no Firestore
        await updateDoc(pedidoRef, { status: "finalizado" });
        
        // Recarrega todos os pedidos, incluindo os finalizados
        carregarPedidos();
  
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
      } catch (e) {
        console.error("Erro ao atualizar pedido: ", e);
      }
    }
    modalConfirmacao.style.display = "none";
  });
  
  
  
  

  cancelarBtn.addEventListener("click", function() {
    modalConfirmacao.style.display = "none";
  });
});
