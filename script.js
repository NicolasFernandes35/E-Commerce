// busca os dados da api //
let produtosGlobal = [];
let compras = [];
let numeroCarrinho = 0;

function updateCartBadge() {
  let badge = document.getElementById('cart-count');
  if (!badge) {
    const header = document.querySelector('.header') || document.body;
    badge = document.createElement('span');
    badge.id = 'cart-count';
    badge.style.marginLeft = '8px';
    badge.style.background = '#ff3b30';
    badge.style.color = '#fff';
    badge.style.padding = '2px 6px';
    badge.style.borderRadius = '12px';
    badge.style.fontSize = '0.8rem';
    header.appendChild(badge);
  }
  badge.textContent = numeroCarrinho;
}


fetch("https://dummyjson.com/products")
  .then(res => res.json())
  .then(data => {
    produtosGlobal = data.products || [];
    const container = document.getElementById("produto-card");
    if (!container) return;

    // monta os cards
    container.innerHTML = ''; // limpa
    for (let i = 0; i < Math.min(produtosGlobal.length, 30); i++) {
      const p = produtosGlobal[i];
      container.innerHTML += `
        <div class="card product" data-index="${i}">
          <img src="${p.thumbnail}" alt="${p.title}" />
          <h2 class="product-name">${p.title}</h2>
          <p>${p.description}</p>
          <div class="price product-price">R$ ${p.price}</div>
          <div class="rating">Rating: ${p.rating}</div>
          <button class="buy-btn" data-index="${i}" data-name="${encodeURIComponent(p.title)}" data-price="R$ ${p.price}">Comprar</button>
          <button class="btn-carrinho" data-index="${i}">Carrinho</button>
        </div>`;
    }

    updateCartBadge();
  })
  .catch(error => {
    console.error("Erro ao carregar produto", error);
    const container = document.getElementById("produto-card");
    if (container) container.innerHTML = '<p>Erro ao carregar produto</p>';
  });

// delegação de eventos para buy-btn e btn-carrinho
document.addEventListener('click', (e) => {
  const buy = e.target.closest('.buy-btn');
  if (buy) {
    const idx = Number(buy.dataset.index);
    const name = decodeURIComponent(buy.dataset.name || '') || produtosGlobal[idx]?.title;
    const price = buy.dataset.price || produtosGlobal[idx]?.price;
    // abre modal com os dados (função openModal definida mais abaixo)
    openModal && openModal({ name, price });
    return;
  }

  const cartBtn = e.target.closest('.btn-carrinho');
  if (cartBtn) {
    const idx = Number(cartBtn.dataset.index);
    const prod = produtosGlobal[idx];
    if (prod) {
      compras.push(prod);
      numeroCarrinho += 1;
      updateCartBadge();
      // feedback simples
      cartBtn.textContent = 'Adicionado';
      setTimeout(() => cartBtn.textContent = 'Carrinho', 1000);
    }
    return;
  }
});

/* Modal purchase logic */
/* Assumes modal HTML exists in the page with the IDs used below */
(function(){
  const modal = document.getElementById('modal');
  const titleEl = document.getElementById('modal-title');
  const descEl = document.getElementById('modal-desc');
  const confirmBtn = document.getElementById('confirm-buy');
  const cancelBtn = document.getElementById('cancel-buy');
  const closeBtn = modal && modal.querySelector('.modal-close');
  let currentProduct = null;

  // expose openModal for the delegation above
  window.openModal = function(product){
    currentProduct = product || {};
    if (titleEl) titleEl.textContent = product.name ? `Comprar: ${product.name}` : 'Confirmar compra';
    if (descEl) descEl.textContent = product.price ? `Preço: ${product.price}` : 'Deseja confirmar a compra?';
    if (modal) {
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
    }
    if (confirmBtn) confirmBtn.focus();
  };

  function closeModal(){
    if (modal) {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
    }
    currentProduct = null;
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      console.log('Compra confirmada:', currentProduct);
      if (titleEl) titleEl.textContent = 'Compra realizada';
      if (descEl) descEl.textContent = currentProduct?.name ? `${currentProduct.name} comprado por ${currentProduct.price || 'N/A'}` : 'Compra concluída';
      setTimeout(closeModal, 1200);
    });
  }

  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.dataset.close === 'true' || e.target === modal.querySelector('.modal-overlay')) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('show')) closeModal();
  });
})();