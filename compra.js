// carrega compras do localStorage, renderiza e implementa "Encerrar compra"
(function(){
  const listaEl = document.getElementById('compra-list');
  const totalEl = document.getElementById('total-amount');
  const encerrarBtn = document.getElementById('encerrar-btn');
  const voltarBtn = document.getElementById('voltar-btn');

  let compras = JSON.parse(localStorage.getItem('compras') || '[]');

  function formatPrice(value){
    return Number(value).toFixed(2).replace('.', ',');
  }

  function render(){
    if (!listaEl) return;
    listaEl.innerHTML = '';
    if (!compras.length) {
      listaEl.innerHTML = '<p>Seu carrinho está vazio.</p>';
      totalEl.textContent = '0,00';
      return;
    }

    let total = 0;
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '12px';

    compras.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.width = '280px';
      card.innerHTML = `
        <img src="${p.thumbnail || ''}" alt="${p.title || ''}" style="width:100%;height:160px;object-fit:cover;border-radius:6px;margin-bottom:8px;">
        <h3 style="font-size:1rem;margin:0 0 6px 0;">${p.title || 'Produto'}</h3>
        <div style="font-weight:bold;color:#6db619">R$ ${formatPrice(p.price || 0)}</div>
      `;
      container.appendChild(card);
      total += Number(p.price || 0);
    });

    listaEl.appendChild(container);
    totalEl.textContent = formatPrice(total);
  }

  // ação de encerrar compra: limpar localStorage e redirecionar com confirmação
  if (encerrarBtn) {
    encerrarBtn.addEventListener('click', () => {
      if (!compras.length) {
        alert('Carrinho vazio.');
        return;
      }
      // aqui você pode chamar API ou registrar pedido — por enquanto apenas limpa
      localStorage.removeItem('compras');
      compras = [];
      render();
      alert('Compra encerrada com sucesso.');
      // volta para a página inicial
      window.location.href = 'index.html';
    });
  }

  if (voltarBtn) {
    voltarBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  render();
})();