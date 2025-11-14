// busca os dados da api //
let produtosGlobal = [];
let compras = JSON.parse(localStorage.getItem('compras') || '[]');
let numeroCarrinho = compras.length || 0;

function updateCartBadge() {
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = numeroCarrinho;
  }
}

const container = document.getElementById("produto-card");

function renderProducts(list) {
  if (!container) return;
  container.innerHTML = '';
  const max = Math.min(list.length, 60);
  for (let i = 0; i < max; i++) {
    const p = list[i];
    const div = document.createElement('div');
    div.className = 'card product';
    div.dataset.index = i;
    div.innerHTML = `
      <img src="${p.thumbnail}" alt="${p.title}" />
      <h2 class="product-name">${p.title}</h2>
      <p>${p.description}</p>
      <div class="meta">
        <div class="price">R$ ${p.price}</div>
        <div class="rating">★ ${p.rating}</div>
      </div>
      <div class="actions">
        <button class="btn-carrinho" data-index="${i}">Adicionar</button>
        <button class="buy-btn" data-index="${i}" data-name="${encodeURIComponent(p.title)}" data-price="R$ ${p.price}">Comprar</button>
      </div>
    `;
    container.appendChild(div);
  }
}

fetch("https://dummyjson.com/products")
  .then(res => res.json())
  .then(data => {
    produtosGlobal = data.products || [];
    renderProducts(produtosGlobal.slice(0, 30));
    updateCartBadge();
  })
  .catch(error => {
    console.error("Erro ao carregar produto", error);
    if (container) container.innerHTML = '<p>Erro ao carregar produto</p>';
  });

// delegação de eventos para buy-btn e btn-carrinho
document.addEventListener('click', (e) => {
  // buy modal
  const buy = e.target.closest('.buy-btn');
  if (buy) {
    const idx = Number(buy.dataset.index);
    const name = decodeURIComponent(buy.dataset.name || '') || produtosGlobal[idx]?.title;
    const price = buy.dataset.price || produtosGlobal[idx]?.price;
    openModal && openModal({ name, price });
    return;
  }

  // add to cart
  const cartBtn = e.target.closest('.btn-carrinho');
  if (cartBtn) {
    const idx = Number(cartBtn.dataset.index);
    const prod = (produtosGlobal[idx]);
    if (prod) {
      compras.push(prod);
      // persist
      localStorage.setItem('compras', JSON.stringify(compras));
      numeroCarrinho = compras.length;
      updateCartBadge();
      // feedback
      const original = cartBtn.textContent;
      cartBtn.textContent = 'Adicionado';
      setTimeout(() => cartBtn.textContent = original, 900);
    }
    return;
  }
});

// search handling
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', (ev) => {
    const q = ev.target.value.trim().toLowerCase();
    if (!q) {
      renderProducts(produtosGlobal.slice(0, 30));
      return;
    }
    const filtered = produtosGlobal.filter(p => p.title.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    renderProducts(filtered.slice(0, 60));
  });
}

// cart click to proceed to checkout
const cartEl = document.getElementById('cart');
if (cartEl) {
  cartEl.addEventListener('click', () => {
    window.location.href = 'compra.html';
  });
}

// ensure badge initialized
updateCartBadge();

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